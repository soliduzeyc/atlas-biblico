// Motor del Atlas Bíblico — portado de docs/prototipo-mapa-original.html.
// Misma lógica de render (modos punto/zona/inferido, texturas de línea según
// confianza, halos de incertidumbre, toggle de capa "tribu_posterior"), pero
// los datos se cargan por fetch en vez de venir embebidos.
import L from 'leaflet';
import { buildIndex, search as runSearch } from './search.js';

const CONF = { alta: '#5F7248', media: '#B0813C', baja: '#8A8C85' };
const SIG = { verificada: '●', provisional: '◍', pendiente: '○', no_aplica: '▤' };

/**
 * Los archivos de datos del atlas no comparten un esquema idéntico: se han ido
 * levantando en tandas distintas. Esta capa los lleva a la forma canónica al
 * cargar, sin tocar el archivo en disco, para que un archivo nuevo no obligue a
 * reescribir el motor ni a editar datos ya investigados.
 *
 * Sin esto un archivo sin `pertenece_a` tumba la página entera: popupHTML hace
 * `p.pertenece_a.map(...)` y lanza TypeError antes de pintar el primer marcador.
 */
function adaptFeatures(features) {
  features.forEach(f => {
    const p = f.properties;

    // "notas" (plural) en las tandas nuevas.
    if (p.nota == null && p.notas != null) p.nota = p.notas;

    // Sin coordenada_estado: se deduce de si hay geometría. No inventa nada,
    // solo traduce lo que el archivo ya afirma al vocabulario del motor.
    if (!p.coordenada_estado) {
      p.coordenada_estado = f.geometry ? 'provisional' : 'pendiente';
    }

    // Algunas tandas usan "provisional" como valor de confianza; la escala
    // canónica es alta/media/baja. Se refleja como intermedia para el color.
    if (!CONF[p.confianza]) p.confianza = p.confianza === 'provisional' ? 'media' : 'baja';

    // aliases: unos archivos usan {forma}, otros {nombre}.
    if (Array.isArray(p.aliases)) {
      p.aliases = p.aliases.map(a => (a && a.forma == null && a.nombre != null)
        ? { ...a, forma: a.nombre } : a);
    }

    if (!Array.isArray(p.pertenece_a)) p.pertenece_a = [];
    if (p.identificacion === undefined) p.identificacion = null;

    // identificacion_disputada -> la forma que ya dibuja el motor.
    if (!p.lectura_alternativa && p.identificacion_disputada) {
      const dq = p.identificacion_disputada;
      const coord = dq.coordenada_alternativa;
      p.lectura_alternativa = {
        etiqueta: 'Lectura alternativa',
        identificacion: dq.lectura_alternativa || null,
        fuente: dq.fuente_alternativa || null,
        coordenada_estado: 'derivada',
        geometry: Array.isArray(coord) ? { type: 'Point', coordinates: coord } : null,
        derivacion: Array.isArray(coord) ? { radio_halo_m: 0 } : null,
        nota: dq.lectura_adoptada ? `Lectura adoptada por este archivo: ${dq.lectura_adoptada}` : null
      };
    }
  });
  return features;
}

/** Etiqueta del encabezado de tramo: acepta entero o cadena ("sur_juda"). */
function tramoLabel(t) {
  if (typeof t === 'number') return `Tramo ${t}`;
  const s = String(t).replace(/[_-]+/g, ' ').trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function haversineKm(p, q) {
  const R = 6371, dLat = (q[1] - p[1]) * Math.PI / 180, dLon = (q[0] - p[0]) * Math.PI / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(p[1] * Math.PI / 180) * Math.cos(q[1] * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function segmentoOf(f) {
  // Cada "segmento" es una línea fronteriza independiente (p.ej. el límite
  // norte compartido con Benjamín y el límite sur por Cadés-Barnea son dos
  // rutas distintas). Los inferidos solo se interpolan entre anclas de su
  // propio segmento, y la línea nunca conecta el final de uno con el
  // comienzo de otro aunque el "orden" global sea consecutivo.
  return f.properties.segmento || 'default';
}

function groupBySegmento(F) {
  const groups = new Map();
  F.forEach(f => {
    const seg = segmentoOf(f);
    if (!groups.has(seg)) groups.set(seg, []);
    groups.get(seg).push(f);
  });
  return groups;
}

function anchorsFor(group, i) {
  // Solo los rasgos con render "punto"/"inferido" tienen una coordenada
  // puntual válida como ancla. Las "zona" son LineString/Polygon y no sirven
  // para interpolar una posición.
  const isAnchor = f => f.geometry && f.properties.render !== 'zona';
  let a = null, b = null;
  for (let k = i - 1; k >= 0; k--) if (isAnchor(group[k])) { a = group[k]; break; }
  for (let k = i + 1; k < group.length; k++) if (isAnchor(group[k])) { b = group[k]; break; }
  return [a, b];
}

function computePositions(F) {
  const POS = {};
  for (const group of groupBySegmento(F).values()) {
    group.forEach((f, i) => {
      const p = f.properties;
      if (p.render === 'zona') return;
      if (f.geometry) {
        POS[p.id] = { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0], inferida: false, haloM: 0 };
        return;
      }
      const [a, b] = anchorsFor(group, i);
      if (!a || !b) return;
      const t = (p.orden - a.properties.orden) / (b.properties.orden - a.properties.orden);
      const A = a.geometry.coordinates, B = b.geometry.coordinates;
      POS[p.id] = {
        lat: A[1] + (B[1] - A[1]) * t, lng: A[0] + (B[0] - A[0]) * t,
        inferida: true, haloM: haversineKm(A, B) * 1000 * 0.35
      };
    });
  }
  return POS;
}

function segStyle(a, b) {
  const rank = x => x === 'verificada' ? 0 : x === 'provisional' ? 1 : 2;
  const w = Math.max(rank(a.coordenada_estado), rank(b.coordenada_estado));
  if (w === 0) return { color: '#232A28', weight: 2.4, opacity: .85 };
  if (w === 1) return { color: '#232A28', weight: 2, opacity: .6, dashArray: '9 5' };
  return { color: '#8A8C85', weight: 1.6, opacity: .55, dashArray: '1 6', lineCap: 'round' };
}

function popupHTML(p) {
  const est = { verificada: 'Verificada', provisional: 'Provisional', pendiente: 'Posición inferida' }[p.coordenada_estado];
  const cls = p.confianza === 'alta' ? 'hi' : p.confianza === 'media' ? 'md' : '';
  let h = `<div class="pop"><h3>${p.nombre}</h3>`;
  h += `<div class="ident">${p.identificacion || 'Sin identificación propuesta'}</div>`;
  h += `<div class="tags"><span class="tag ${cls}">Confianza ${p.confianza}</span>`
    + `<span class="tag">${est}</span>`
    + (p.precision ? `<span class="tag">${p.precision}</span>` : '')
    + (p.tribu_posterior ? `<span class="tag dan">Después: Dan</span>` : '') + `</div>`;
  h += `<dl class="meta"><dt>Texto</dt><dd>${(p.referencias || []).join(' · ')}</dd>`;
  if (p.pertenece_a && p.pertenece_a.length)
    h += `<dt>Tribu</dt><dd>${p.pertenece_a.map(x => x === 'juda' ? 'Judá' : 'Benjamín').join(' y ')}</dd>`;
  if (p.fuente) h += `<dt>Fuente</dt><dd>${p.fuente}</dd>`;
  h += `</dl>`;
  if (p.coordenada_estado === 'pendiente' && p.__hasPos)
    h += `<div class="note"><strong>Esta posición no es un dato.</strong> Se ha deducido de la secuencia del texto entre los dos puntos conocidos más cercanos. El halo indica cuánto margen hay.</div>`;
  else if (p.nota) h += `<div class="note">${p.nota}</div>`;
  if (p.tribu_posterior) {
    const tp = p.tribu_posterior, lbl = { nombrado: 'Nombrada en el texto', probable: 'Identificación probable', solo_cartografico: 'Solo en el mapa, no en el texto' }[tp.certeza];
    h += `<div class="dan-note"><strong>Reasignada a Dan</strong> · ${lbl}${tp.referencia ? ' · ' + tp.referencia : ''}<br>${tp.nota}</div>`;
  }
  if (p.advertencia) h += `<div class="warn">${p.advertencia}</div>`;
  if (p.aliases && p.aliases.length)
    h += `<div class="alias">También: ${p.aliases.map(a => a.forma).join(' · ')}</div>`;
  return h + `</div>`;
}

export async function initAtlasMap(root) {
  const fuentes = JSON.parse(root.dataset.fuentes || '[]');
  const mapEl = root.querySelector('[data-role="map"]');
  const railEl = root.querySelector('[data-role="rail"]');
  const tallyEl = root.querySelector('[data-role="tally"]');
  const subtitleEl = root.querySelector('[data-role="subtitle"]');
  const railToggleEl = root.querySelector('[data-role="rail-toggle"]');
  const railToggleLabelEl = root.querySelector('[data-role="rail-toggle-label"]');
  const searchEl = root.querySelector('[data-role="search"]');
  const searchClearEl = root.querySelector('[data-role="search-clear"]');

  // En pantallas estrechas los controles y la leyenda van plegados: si no,
  // se comen el panel entero y solo caben dos lugares de la lista.
  const compact = window.matchMedia('(max-width: 820px)').matches;

  // Una tribu puede tener su frontera repartida en varios archivos, levantados
  // en tandas distintas. Se cargan todos y cada archivo pasa a ser un tramo:
  // así la página muestra la frontera completa sin fundir los datos en disco,
  // que conservan su procedencia y su esquema propios.
  const cargas = await Promise.all(fuentes.map(async (f) => {
    const res = await fetch(f.url);
    const data = await res.json();
    return { fuente: f, data };
  }));

  const DATA = cargas[0]?.data || { features: [], metadata: {} };
  const segmentosLabels = {};

  const F = [];
  cargas.forEach(({ fuente, data }, i) => {
    // Clave de agrupación: una por archivo cuando hay varios.
    const clave = cargas.length > 1 ? `f${i}` : (null);
    const etiqueta = fuente.etiqueta || data.metadata?.titulo || null;
    if (clave && etiqueta) segmentosLabels[clave] = etiqueta;

    adaptFeatures(data.features.slice()).forEach(feat => {
      if (clave) feat.properties.segmento = clave;
      F.push(feat);
    });
  });
  // El orden es relativo a cada archivo, así que solo ordena dentro del grupo.
  F.sort((a, b) =>
    String(a.properties.segmento ?? '').localeCompare(String(b.properties.segmento ?? '')) ||
    a.properties.orden - b.properties.orden);
  const byId = Object.fromEntries(F.map(f => [f.properties.id, f]));
  const POS = computePositions(F);
  F.forEach(f => { f.properties.__hasPos = !!POS[f.properties.id]; });

  if (subtitleEl) {
    // Reúne los pasajes de todos los archivos cargados, sin repetirlos.
    const pasajes = [...new Set(cargas.flatMap(({ data }) => {
      const m = data.metadata || {};
      return m.pasajes || [m.pasaje_base, m.pasaje_paralelo].filter(Boolean);
    }))];
    if (pasajes.length) subtitleEl.textContent = pasajes.join(' · ');
  }

  const map = L.map(mapEl, { zoomControl: true, attributionControl: true }).setView([31.79, 35.12], 10);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap · CARTO', subdomains: 'abcd', maxZoom: 18
  }).addTo(map);

  const layerZone = L.layerGroup().addTo(map);
  const layerHalo = L.layerGroup().addTo(map);
  const layerLine = L.layerGroup().addTo(map);
  const layerAlt = L.layerGroup().addTo(map);
  const layerMark = L.layerGroup().addTo(map);

  function drawZones() {
    layerZone.clearLayers();
    F.forEach(f => {
      const p = f.properties;
      if (p.render !== 'zona' || !f.geometry) return;
      const verified = p.coordenada_estado === 'verificada';
      const coords = f.geometry.coordinates.map(c => [c[1], c[0]]);
      const ln = L.polyline(coords, {
        color: '#3E6572', weight: verified ? 3 : 2, opacity: verified ? .6 : .42,
        dashArray: verified ? null : '2 7', lineCap: 'round'
      }).addTo(layerZone);
      ln.bindTooltip(p.nombre, { sticky: true, className: 'zone-tip' });
      ln.on('click', () => {
        L.popup({ maxWidth: 290 }).setLatLng(coords[Math.floor(coords.length / 2)])
          .setContent(popupHTML(p)).openOn(map);
      });
    });
  }

  function drawLine() {
    layerLine.clearLayers();
    for (const group of groupBySegmento(F).values()) {
      const pts = group.filter(f => POS[f.properties.id]);
      for (let i = 0; i < pts.length - 1; i++) {
        const A = POS[pts[i].properties.id], B = POS[pts[i + 1].properties.id];
        L.polyline([[A.lat, A.lng], [B.lat, B.lng]],
          segStyle(pts[i].properties, pts[i + 1].properties)).addTo(layerLine);
      }
    }
  }

  // Lecturas alternativas: cuando dos autoridades citadas sitúan el mismo
  // topónimo en puntos distintos, se dibujan las dos y se unen con una línea,
  // en vez de que el atlas elija por su cuenta.
  function drawAlt() {
    layerAlt.clearLayers();
    F.forEach(f => {
      const p = f.properties;
      const alt = p.lectura_alternativa;
      if (!alt || !alt.geometry) return;
      const base = POS[p.id];
      if (!base) return;

      const aLat = alt.geometry.coordinates[1], aLng = alt.geometry.coordinates[0];
      const radio = alt.derivacion?.radio_halo_m || 0;

      if (radio > 0) {
        L.circle([aLat, aLng], {
          radius: radio, color: '#3E6572', weight: 1, opacity: .35,
          fillColor: '#3E6572', fillOpacity: .06, dashArray: '2 4', className: 'halo'
        }).addTo(layerAlt);
      }

      // La línea de discrepancia: une las dos lecturas del mismo lugar.
      L.polyline([[base.lat, base.lng], [aLat, aLng]], {
        color: '#3E6572', weight: 1.6, opacity: .7, dashArray: '5 4'
      }).addTo(layerAlt)
        .bindTooltip(`${p.nombre}: dos lecturas`, { sticky: true, className: 'zone-tip' });

      const r = 9;
      const icon = L.divIcon({
        className: '', iconSize: [r * 2, r * 2], iconAnchor: [r, r],
        html: `<span class="wrap" style="width:${r * 2}px;height:${r * 2}px">
          <span class="mk alt-mk" style="width:${r * 2}px;height:${r * 2}px;
            background:transparent;border:2px dashed #3E6572"></span></span>`
      });
      L.marker([aLat, aLng], { icon, riseOnHover: true })
        .bindPopup(altPopupHTML(p, alt), { maxWidth: 290 })
        .addTo(layerAlt);
    });
  }

  function altPopupHTML(p, alt) {
    let h = `<div class="pop"><h3>${p.nombre}</h3>`;
    h += `<div class="ident">${alt.identificacion || ''}</div>`;
    h += `<div class="tags"><span class="tag dan">${alt.etiqueta || 'Lectura alternativa'}</span>`
      + `<span class="tag">Posición derivada</span></div>`;
    if (alt.derivacion) {
      const dv = alt.derivacion;
      h += `<dl class="meta">`;
      if (dv.distancia_km) h += `<dt>Distancia</dt><dd>${dv.distancia_km} km desde la otra lectura</dd>`;
      if (dv.fuente_distancia) h += `<dt>Según</dt><dd>${dv.fuente_distancia}</dd>`;
      h += `</dl>`;
    }
    if (alt.nota) h += `<div class="dan-note">${alt.nota}</div>`;
    if (alt.fuente) h += `<div class="alias">Fuente: ${alt.fuente}</div>`;
    return h + `</div>`;
  }

  const marks = {};
  let showDan = false;
  function drawMarks(showInf) {
    layerMark.clearLayers(); layerHalo.clearLayers();
    F.forEach(f => {
      const p = f.properties, q = POS[p.id];
      if (!q) return;
      if (q.inferida && !showInf) return;
      const col = CONF[p.confianza];
      if (q.inferida && q.haloM > 0)
        L.circle([q.lat, q.lng], {
          radius: q.haloM, color: col, weight: 1, opacity: .3,
          fillColor: col, fillOpacity: .06, dashArray: '2 4', className: 'halo'
        }).addTo(layerHalo);
      const solid = p.coordenada_estado === 'verificada';
      const dash = p.coordenada_estado === 'pendiente';
      const r = solid ? 7 : 11;
      const dan = showDan && p.tribu_posterior;
      const R = dan ? r + 5 : r;
      const ring = dan ? `<span class="dan" style="width:${R * 2}px;height:${R * 2}px;
          border:1.5px ${p.tribu_posterior.certeza === 'nombrado' ? 'solid' : 'dashed'} #3E6572"></span>` : '';
      const icon = L.divIcon({
        className: '', iconSize: [R * 2, R * 2], iconAnchor: [R, R],
        html: `<span class="wrap" style="width:${R * 2}px;height:${R * 2}px">${ring}<span class="mk" style="width:${r * 2}px;height:${r * 2}px;
          background:${solid ? col : 'transparent'};
          border:${solid ? '2px solid #E4E3DB' : (dash ? '1.5px dashed ' : '2px solid ') + col};
          box-shadow:${solid ? '0 0 0 1px ' + col : 'none'}"></span></span>`
      });
      const m = L.marker([q.lat, q.lng], { icon, riseOnHover: true })
        .bindPopup(popupHTML(p), { maxWidth: 290, closeButton: true }).addTo(layerMark);
      m.on('click', () => select(p.id, false));
      marks[p.id] = m;
    });
  }

  let listEl = null;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function rowHTML(f, motivo) {
    const p = f.properties, q = POS[p.id];
    const sg = p.render === 'zona' ? SIG.no_aplica : SIG[p.coordenada_estado];
    const isZoneDrawn = p.render === 'zona' && f.geometry;
    const dim = !q && !isZoneDrawn;
    const sub = p.render === 'zona'
      ? (isZoneDrawn ? 'Zona · trazada' : 'Zona · sin trazar todavía')
      : (p.identificacion || 'sin identificación');
    return `<div class="row${dim ? ' dim' : ''}" data-id="${p.id}">
      <span class="n">${String(p.orden).padStart(2, '0')}</span>
      <span class="sg c-${p.confianza}">${sg}</span>
      <span><span class="nm">${esc(p.nombre)}</span>
      <span class="id">${esc(sub)}</span>${motivo ? `<span class="motivo">${esc(motivo)}</span>` : ''}${
        p.lectura_alternativa ? `<span class="alt-flag">Dos lecturas · ${esc(p.lectura_alternativa.etiqueta || '')}</span>` : ''
      }</span>
    </div>`;
  }

  function attachRows() {
    listEl.querySelectorAll('.row').forEach(el =>
      el.addEventListener('click', () => select(el.dataset.id, true)));
  }

  function renderFullList() {
    const segmentoLabels = { ...(DATA.metadata?.segmentos || {}), ...segmentosLabels };
    let h = '';
    for (const [seg, group] of groupBySegmento(F)) {
      if (segmentoLabels[seg]) h += `<div class="segmento">${esc(segmentoLabels[seg])}</div>`;
      const tramos = [...new Set(group.map(f => f.properties.tramo))]
        .sort((a, b) => (typeof a === 'number' && typeof b === 'number') ? a - b : String(a).localeCompare(String(b)));
      // Un solo tramo bajo un segmento ya titulado no necesita su propia
      // cabecera: repetiría lo que acaba de leerse.
      const ocultarTramo = tramos.length === 1 && !!segmentoLabels[seg];
      tramos.forEach(t => {
        if (!ocultarTramo) h += `<div class="tramo">${esc(tramoLabel(t))}</div>`;
        group.filter(f => f.properties.tramo === t).forEach(f => { h += rowHTML(f, null); });
      });
    }
    listEl.innerHTML = h;
    attachRows();
  }

  function renderResults(results, query) {
    if (!results.length) {
      listEl.innerHTML = `<div class="no-res">Ningún lugar coincide con <b>${esc(query)}</b>.
        <br>El buscador conoce los alias de cada traducción, el nombre del sitio moderno
        y los versículos: prueba con otra grafía o con una cita como «Jos 15:7».</div>`;
      return;
    }
    const n = results.length;
    let h = `<div class="res-hdr">${n} ${n === 1 ? 'resultado' : 'resultados'}</div>`;
    h += results.map(r => rowHTML(r.feature, r.motivo)).join('');
    listEl.innerHTML = h;
    attachRows();
  }

  function buildRail() {
    // Las cabeceras de tramo las pinta renderFullList; aquí solo el armazón.
    const openAttr = compact ? '' : ' open';
    let h = `<details class="fold ctrls-fold"${openAttr}>
      <summary>Opciones de visualización</summary>
      <div class="ctrls">
        <label><input type="checkbox" id="tInf" checked> Mostrar posiciones inferidas</label>
        <label><input type="checkbox" id="tLine" checked> Mostrar el trazado de la frontera</label>
        <label><input type="checkbox" id="tDan"> Marcar lo que después pasó a Dan</label>
        <label><input type="checkbox" id="tZone" checked> Mostrar valles y regiones</label>
        <label><input type="checkbox" id="tAlt" checked> Mostrar lecturas alternativas</label>
      </div>
    </details>`;
    // La lista va en su propio contenedor: al buscar se reemplaza solo esta
    // parte, dejando intactos los controles y sus escuchadores.
    h += `<div data-role="list"></div>`;
    h += `<details class="fold leg-fold"${openAttr}>
      <summary>Cómo leer el mapa</summary>
      <div class="leg">
      <dl>
        <dt style="color:var(--olive)">●</dt><dd>Coordenada verificada con fuente</dd>
        <dt style="color:var(--olive)">◍</dt><dd>Provisional: sin fuente confirmada, pero coherente</dd>
        <dt style="color:var(--ash)">○</dt><dd>Posición deducida de la secuencia del texto</dd>
        <dt style="color:var(--ash)">▤</dt><dd>Zona: valle o rasgo sin polígono todavía</dd>
      </dl>
      <h2>El color dice qué tan segura es la identificación</h2>
      <dl>
        <dt style="color:var(--olive)">●</dt><dd>Alta</dd>
        <dt style="color:var(--ochre)">●</dt><dd>Media</dd>
        <dt style="color:var(--ash)">●</dt><dd>Discutida o desconocida</dd>
      </dl>
      <h2>La línea también informa</h2>
      <dl>
        <dt><span class="swatch" style="background:#232A28;height:3px"></span></dt><dd>Entre dos puntos verificados</dd>
        <dt><span class="swatch" style="background:repeating-linear-gradient(90deg,#232A28 0 6px,transparent 6px 10px);height:2px"></span></dt><dd>Toca un punto provisional</dd>
        <dt><span class="swatch" style="background:repeating-linear-gradient(90deg,#8A8C85 0 2px,transparent 2px 6px);height:2px"></span></dt><dd>Cruza un tramo deducido</dd>
      </dl>
      <h2>Cuando dos fuentes no coinciden</h2>
      <dl>
        <dt style="color:var(--sea)">◌</dt><dd>Segunda lectura del mismo lugar, según otra autoridad citada</dd>
        <dt><span class="swatch" style="background:repeating-linear-gradient(90deg,#3E6572 0 5px,transparent 5px 9px);height:2px"></span></dt><dd>Une las dos lecturas: la distancia es el desacuerdo</dd>
      </dl>
      <div id="danLeg" style="display:none">
      <h2>El anillo azul: territorio que pasó a Dan</h2>
      <dl>
        <dt style="color:var(--sea)">◎</dt><dd>Anillo continuo: la ciudad se nombra en el texto</dd>
        <dt style="color:var(--sea)">◌</dt><dd>Anillo discontinuo: identificación probable, o solo sombreada en un mapa de referencia</dd>
      </dl>
      </div></div></details>`;
    railEl.innerHTML = h;
    listEl = railEl.querySelector('[data-role="list"]');
    renderFullList();
    railEl.querySelector('#tInf').addEventListener('change', e => { drawMarks(e.target.checked) });
    railEl.querySelector('#tLine').addEventListener('change', e => {
      e.target.checked ? layerLine.addTo(map) : map.removeLayer(layerLine)
    });
    railEl.querySelector('#tZone').addEventListener('change', e => {
      e.target.checked ? layerZone.addTo(map) : map.removeLayer(layerZone)
    });
    railEl.querySelector('#tAlt').addEventListener('change', e => {
      e.target.checked ? layerAlt.addTo(map) : map.removeLayer(layerAlt)
    });
    railEl.querySelector('#tDan').addEventListener('change', e => {
      showDan = e.target.checked;
      railEl.querySelector('#danLeg').style.display = showDan ? 'block' : 'none';
      // La leyenda del anillo azul vive dentro del plegable: al activar la capa
      // hay que abrirlo, o el usuario ve anillos nuevos sin explicación.
      if (showDan) railEl.querySelector('.leg-fold')?.setAttribute('open', '');
      drawMarks(railEl.querySelector('#tInf').checked)
    });
  }

  function select(id, fly) {
    railEl.querySelectorAll('.row').forEach(el => el.classList.toggle('on', el.dataset.id === id));
    const f = byId[id];
    if (f && f.properties.render === 'zona' && f.geometry) {
      const coords = f.geometry.coordinates.map(c => [c[1], c[0]]);
      if (fly) map.flyToBounds(L.latLngBounds(coords), { padding: [60, 60], duration: .6 });
      L.popup({ maxWidth: 290 }).setLatLng(coords[Math.floor(coords.length / 2)])
        .setContent(popupHTML(f.properties)).openOn(map);
      const row = railEl.querySelector(`.row[data-id="${id}"]`);
      if (row) row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      return;
    }
    const q = POS[id]; if (!q) return;
    if (fly) map.flyTo([q.lat, q.lng], Math.max(map.getZoom(), 13), { duration: .6 });
    if (marks[id]) marks[id].openPopup();
    const row = railEl.querySelector(`.row[data-id="${id}"]`);
    if (row) row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function tally() {
    const c = n => F.filter(f => f.properties.coordenada_estado === n).length;
    tallyEl.innerHTML =
      `<span><b>${c('verificada')}</b> verificadas</span>` +
      `<span><b>${c('provisional')}</b> provisionales</span>` +
      `<span><b>${c('pendiente')}</b> pendientes</span>` +
      `<span><b>${F.length}</b> lugares</span>`;
  }

  // ---------- buscador ----------
  const index = buildIndex(F);
  let results = [];
  let selIdx = -1;

  function highlight(i) {
    const rows = [...listEl.querySelectorAll('.row')];
    rows.forEach(r => r.classList.remove('sel'));
    if (i < 0 || i >= rows.length) return;
    rows[i].classList.add('sel');
    rows[i].scrollIntoView({ block: 'nearest' });
  }

  function applySearch(q) {
    selIdx = -1;
    if (searchClearEl) searchClearEl.hidden = !q;
    if (!q.trim()) {
      results = [];
      renderFullList();
      return;
    }
    // Con el panel plegado los resultados serían invisibles: hay que abrirlo.
    if (root.classList.contains('rail-hidden')) railToggleEl?.click();
    results = runSearch(index, q);
    renderResults(results, q);
  }

  if (searchEl) {
    searchEl.addEventListener('input', () => applySearch(searchEl.value));

    searchEl.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        searchEl.value = '';
        applySearch('');
        searchEl.blur();
        return;
      }
      if (!results.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selIdx = (selIdx + 1) % results.length;
        highlight(selIdx);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selIdx = selIdx <= 0 ? results.length - 1 : selIdx - 1;
        highlight(selIdx);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        // Sin flechas, Enter va al primer resultado: es lo que se espera
        // tras teclear el nombre completo.
        const r = results[selIdx >= 0 ? selIdx : 0];
        if (r) {
          select(r.id, true);
          searchEl.blur();
        }
      }
    });
  }

  if (searchClearEl) {
    searchClearEl.addEventListener('click', () => {
      searchEl.value = '';
      applySearch('');
      searchEl.focus();
    });
  }

  // Plegar el panel entero deja el mapa a pantalla completa en el móvil.
  if (railToggleEl) {
    railToggleEl.addEventListener('click', () => {
      const hidden = root.classList.toggle('rail-hidden');
      railToggleEl.setAttribute('aria-expanded', String(!hidden));
      if (railToggleLabelEl) {
        railToggleLabelEl.textContent = hidden
          ? `Ver los ${F.length} lugares ▾`
          : 'Ocultar la lista ▴';
      }
      // Leaflet cachea el tamaño del contenedor: sin esto el mapa queda
      // dibujado con la altura vieja y aparece una franja gris.
      map.invalidateSize();
    });
  }

  buildRail(); drawMarks(true); drawLine(); drawZones(); drawAlt(); tally();
  const pts = Object.values(POS);
  if (pts.length) {
    // El encuadre abarca de Jerusalén al Sinaí; en pantallas estrechas un
    // margen de 42 px deja el contenido reducido a una mancha en el centro.
    const pad = compact ? 14 : 42;
    map.fitBounds(L.latLngBounds(pts.map(p => [p.lat, p.lng])), { padding: [pad, pad] });
  }
}
