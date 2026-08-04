// Búsqueda de lugares del atlas.
//
// El problema real aquí no es el error de tecleo, es la transliteración: un
// mismo topónimo aparece como "Cadés-Barnea", "Cades-barnea" y
// "Kadesh-Barnea"; como "Quesalón" y "Kesalón"; como "Carcá" y "Karka". Por
// eso el peso está en normalizar (tildes, guiones, ayin, c/k/q, j/y, s/z)
// y no en la distancia de edición, que solo cubre el dedo gordo.

/** Quita tildes y diacríticos combinantes: "Cadés" -> "cades". */
function stripDiacritics(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Forma canónica para comparar. Colapsa las variantes de transliteración
 * que usan las distintas traducciones y obras de consulta.
 */
export function normalize(s) {
  if (!s) return '';
  let t = stripDiacritics(String(s).toLowerCase());
  // Los ayin y comillas de transliteración son ruido: se barre el bloque de
  // letras modificadoras (U+02B0-U+02FF) porque los datos mezclan varias
  // (U+02BD en "Deir el-ʽAzar", U+02BF en "ʿAin el-Hod").
  t = t.replace(/[\u02b0-\u02ff\u2018\u2019'`\u00b4]/g, '');
  t = t.replace(/[-–—_/]+/g, ' ');
  // Dígrafos antes que letra a letra: "sh" y "kh" -> s, j.
  t = t.replace(/sh/g, 's').replace(/kh/g, 'j');
  // Equivalencias de transliteración al castellano.
  t = t.replace(/[kq]/g, 'c');   // Kadesh/Cadés, Karka/Carcá, Qedeis/Cedeis
  t = t.replace(/[yw]/g, 'j');   // Yavne/Jabneel, Yearim/Jearim
  t = t.replace(/z/g, 's');      // Azmón/Asmón
  t = t.replace(/v/g, 'b');      // Yavne/Jabne
  t = t.replace(/h/g, '');       // la hache es muda y va y viene entre grafías
  t = t.replace(/(.)\1+/g, '$1'); // dobles: "Addar"/"Adar", "Tell"/"Tel"
  return t.replace(/\s+/g, ' ').trim();
}

/** Distancia de Levenshtein acotada: devuelve >max en cuanto se pasa. */
function editDistance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      if (cur[j] < best) best = cur[j];
    }
    if (best > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/**
 * ¿Aparecen todas las palabras de la consulta en el campo? Permite omitir
 * partículas: "deir azar" encuentra "Deir el-ʽAzar".
 *
 * Sustituye a una coincidencia por subsecuencia de letras sueltas, que era
 * demasiado laxa: con ella "cades" casaba con "ladera de la ciudad jebusea"
 * (c-a-d…e-s repartidas por la frase) y ensuciaba los resultados.
 */
function allTokensMatch(qTokens, field) {
  const words = field.split(' ');
  return qTokens.every(tok =>
    field.includes(tok) || words.some(w => w.startsWith(tok))
  );
}

/**
 * Puntúa una consulta ya normalizada contra un campo ya normalizado.
 * Devuelve 0 si no hay coincidencia; a mayor número, mejor.
 */
function scoreField(q, qTokens, field) {
  if (!field) return 0;
  if (field === q) return 100;
  if (field.startsWith(q)) return 80;
  // Prefijo de cualquier palabra: "bar" encuentra "Cadés-Barnea".
  if (field.split(' ').some(w => w.startsWith(q))) return 70;
  if (field.includes(q)) return 55;
  if (qTokens.length > 1 && allTokensMatch(qTokens, field)) return 50;
  if (q.length >= 4) {
    if (editDistance(q, field, 1) <= 1) return 45;
    // Errata dentro de un campo largo: compara contra cada palabra.
    if (field.split(' ').some(w => w.length >= 4 && editDistance(q, w, 1) <= 1)) return 40;
  }
  return 0;
}

/**
 * Construye el índice a partir de los Features del GeoJSON.
 * Cada entrada guarda de dónde salió cada cadena para poder explicar
 * después por qué coincidió.
 */
export function buildIndex(features) {
  return features.map(f => {
    const p = f.properties;
    const campos = [{ tipo: 'nombre', texto: p.nombre, norm: normalize(p.nombre) }];

    (p.aliases || []).forEach(a => {
      if (!a || !a.forma) return;
      campos.push({ tipo: 'alias', texto: a.forma, fuente: a.fuente, norm: normalize(a.forma) });
    });

    if (p.identificacion) {
      campos.push({ tipo: 'identificacion', texto: p.identificacion, norm: normalize(p.identificacion) });
    }

    // Las referencias no se normalizan con las reglas de topónimo: "Jos 15:7"
    // perdería el sentido. Basta con minúsculas y espacios.
    const refs = (p.referencias || []).map(r => String(r).toLowerCase().replace(/\s+/g, ' ').trim());

    return { id: p.id, feature: f, campos, refs };
  });
}

/**
 * Busca en el índice. Devuelve [{ id, feature, score, motivo }] ordenado,
 * donde `motivo` explica la coincidencia si no fue por el nombre principal.
 */
export function search(index, query, limit = 40) {
  const raw = String(query || '').trim();
  if (!raw) return [];

  const q = normalize(raw);
  const qTokens = q.split(' ').filter(Boolean);
  const qRef = raw.toLowerCase().replace(/\s+/g, ' ').trim();
  const out = [];

  for (const entry of index) {
    let best = 0;
    let bestCampo = null;

    for (const campo of entry.campos) {
      // El nombre principal desempata por encima de alias e identificación.
      const bonus = campo.tipo === 'nombre' ? 6 : campo.tipo === 'alias' ? 3 : 0;
      const s = scoreField(q, qTokens, campo.norm);
      if (s > 0 && s + bonus > best) {
        best = s + bonus;
        bestCampo = campo;
      }
    }

    // Referencias bíblicas: "Jos 15:7" o "15:7".
    if (qRef.length >= 3) {
      for (const r of entry.refs) {
        if (r.includes(qRef)) {
          const s = 60;
          if (s > best) { best = s; bestCampo = { tipo: 'referencia', texto: r }; }
          break;
        }
      }
    }

    if (best > 0) out.push({ id: entry.id, feature: entry.feature, score: best, campo: bestCampo });
  }

  out.sort((a, b) =>
    b.score - a.score ||
    a.feature.properties.orden - b.feature.properties.orden
  );

  return out.slice(0, limit).map(r => ({
    id: r.id,
    feature: r.feature,
    score: r.score,
    motivo: motivoDe(r.campo),
  }));
}

/** Texto corto que explica la coincidencia; null si fue por el nombre. */
function motivoDe(campo) {
  if (!campo || campo.tipo === 'nombre') return null;
  if (campo.tipo === 'alias') {
    return campo.fuente
      ? `coincide con «${campo.texto}» (${campo.fuente})`
      : `coincide con «${campo.texto}»`;
  }
  if (campo.tipo === 'identificacion') return `coincide con «${campo.texto}»`;
  if (campo.tipo === 'referencia') return `citado en ${campo.texto}`;
  return null;
}
