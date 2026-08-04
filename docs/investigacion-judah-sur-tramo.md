# Límite sur de Judá — Cadés-Barnea (v1.0)

**Proyecto:** Atlas bíblico interactivo
**Alcance de esta tanda:** frontera sur de Judá (segmento independiente, no compartido con Benjamín)
**Pasajes base:** Josué 15:1-4 · Números 34:3-5 (paralelo, con una fusión de nombres — ver §3)
**Traducción de referencia:** Traducción del Nuevo Mundo, revisión 2019
**Fecha:** 3 de agosto de 2026
**Estado:** investigación inicial completa — 2 verificadas, 1 provisional, 6 pendientes

---

## 1. Por qué es un segmento aparte

El límite norte de Judá (documentado en `investigacion-judah-benjamin-tramo1.md`) es una sola ruta continua compartida con Benjamín. El límite sur es una **línea geográficamente distinta**: corre del extremo sur del mar Salado hacia el oeste, por el desierto de Zin y Cadés-Barnea, hasta el torrente de Egipto y el Mediterráneo. No conecta con el límite norte en ningún punto de esta lista.

Por eso en el GeoJSON estos registros llevan `"segmento": "sur"` (los del límite norte se retro-etiquetaron `"segmento": "norte"`). El motor de render (`src/lib/map-engine.js`) agrupa la interpolación y el trazado de línea por `segmento`, para que un punto pendiente del sur nunca se interpole usando un ancla del norte, ni la línea dibujada salte de un extremo del territorio al otro.

---

## 2. Clave de confianza

| Símbolo | Significado |
|---|---|
| 🟢 | Ubicación firme o consenso citado por la fuente |
| 🟡 | Propuesta fundada, pero declarada como probable |
| 🔴 | Discutida, desconocida, o sin fuente verificada aún |

---

## 3. Tramo 4 — Bahía sur del mar Salado → el Mar (torrente de Egipto)

*Jos 15:1-4 · Nm 34:3-5*

| # | Nombre (TNM 2019) | Identificación moderna | Conf. | Fuente |
|---|---|---|---|---|
| 28 | Bahía sur del mar Salado | Extremo sur del mar Muerto ("la lengua") — sin coordenada única citable | 🟢 | Texto |
| 29 | Subida de Acrabim | Naqb es-Safa / Maʽale Aqrabim | 🟢 | Wikipedia/Wikidata |
| 30 | Desierto de Zin | Región entre el Négueb y el Arabá, al SO del mar Salado | 🟢 | Texto |
| 31 | Cadés-Barnea | Tell el-Qudeirat | 🟢 | Consenso arqueológico |
| 32 | Hezrón | Desconocida | 🔴 | — |
| 33 | Addar | Desconocida | 🔴 | — |
| 34 | Carcá | Desconocida | 🔴 | — |
| 35 | Azmón | Disputada (2 candidatos) | 🔴 | — |
| 36 | Torrente de Egipto | Wadi al-Arish, desembocadura | 🟢 | Wikipedia |

---

## 4. La fusión de nombres entre Josué 15 y Números 34

Igual que el límite norte cruza Josué 15 con Josué 18, este segmento cruza Josué 15 con Números 34 — pero aquí los dos pasajes **no dicen lo mismo número de nombres**:

- **Josué 15:3** (TNM 2019): "...llegaba a **Hezrón**, subía hasta **Addar** y daba la vuelta hacia **Carcá**." → tres puntos.
- **Números 34:4** (TNM 2019): "...irá hasta **Hazar-Addar** y seguirá hasta Azmón." → Hezrón y Addar aparecen **fusionados** en un solo nombre compuesto ("recinto/aldea de Addar"), y **Carcá no se menciona en absoluto**.

**Decisión del proyecto:** documentar ambos como registros separados (`hezron-sur`, `addar`), siguiendo la lista más detallada de Josué 15, y anotar la fusión de Números en el campo `nota` de cada uno. `Carcá` queda como registro propio, exclusivo de Josué 15.

---

## 5. Detalle de lo verificado

### 5.1 Cadés-Barnea → Tell el-Qudeirat
Identificación por consenso arqueológico moderno. El manantial ʽEin el-Qudeirat es el más caudaloso del Sinaí; junto al tell se excavó una fortaleza israelita (Cohen y Bernick-Greenberg, *Excavations at Kadesh Barnea*). Coordenada: 30.64806, 34.42278 ([Wikipedia, "Tell el-Qudeirat"](https://en.wikipedia.org/wiki/Tell_el-Qudeirat)).

Existe un candidato más antiguo, ʽAin Qedeis, ~8 km al SSE — hoy la bibliografía lo asocia más bien con Hazar-Addar, no con Cadés-Barnea (G. E. Wright, *Biblical Archaeology*, 1962).

### 5.2 Subida de Acrabim → Naqb es-Safa / Maʽale Aqrabim
Caso inusual: el nombre bíblico sobrevivió casi intacto hasta hoy. El paso de montaña en la Ruta 227 de Israel se sigue llamando Maʽale Aqrabim ("subida de los escorpiones"), y es sitio patrimonial reconocido. Coordenada: 30.90667, 35.13167 ([Wikipedia/Wikidata, "Ma'ale Akrabim"](https://en.wikipedia.org/wiki/Ma%27ale_Akrabim_massacre)).

Se marca como **provisional**, no verificada: la "subida" bíblica es un tramo de camino, no un punto exacto, y la continuidad toponímica —aunque fuerte— no es lo mismo que una identificación arqueológica confirmada in situ.

### 5.3 Torrente de Egipto → Wadi al-Arish
Identificación mayoritaria desde Ishtori Haparchi (s. XIV) hasta la erudición moderna. Coordenada de la desembocadura en el Mediterráneo: 31.14571, 33.80649 ([Wikipedia, "Wadi al-Arish"](https://en.wikipedia.org/wiki/Wadi_al-Arish) / ["Brook of Egypt"](https://en.wikipedia.org/wiki/Brook_of_Egypt)). No es el Nilo — es un uadi estacional del Sinaí, ~85 km al sur de donde el límite oeste de Judá toca el mar en el tramo 3 (Ashdod/Nitzanim).

---

## 5 bis. Revisión contra Perspicacia (3 de agosto de 2026) — y una divergencia de fondo

La primera pasada de esta investigación usó **solo fuentes seculares**. Fue un error de método: no busqué en Perspicacia porque busqué con las grafías de la TNM 2019, y Perspicacia usa las suyas, con **Q** donde la revisión moderna pone **C**:

| TNM 2019 | Perspicacia |
|---|---|
| Cadés-Barnea | **Qadés-barnea** (entrada «Qadés») |
| Carcá | **Qarqá** |
| Subida de Acrabim | subida de **Aqrabim** |

Buscando con esas formas aparecen entradas propias para lugares que yo había dado por "sin propuesta de identificación". Lo que cambia:

- **Azmón deja de estar en disputa.** Perspicacia lo sitúa en **ʽAin el-Qeseimeh**, y lo usa como punto de referencia para localizar Qarqá. Sube de confianza `baja` a `media`. Resuelve a favor de uno de los dos candidatos seculares (el otro era ʽAin Muweileh).
- **Qarqá gana una propuesta citable.** La entrada declara que "su ubicación exacta se desconoce", pero recoge que algunos eruditos la identifican tentativamente con un estanque bien construido en la confluencia de Wadi el-ʽAin con Wadi Umm Hashim, a unos 4 km al ESE de Azmón. Sigue sin coordenada: la propia fuente no da cifras.
- **Addar gana una propuesta citable.** Perspicacia recoge que *Biblical Archaeology* (G. E. Wright) propone **ʽAin el-Qudeirat**.

### La divergencia: ¿dónde está Qadés-barnea?

Este es el hallazgo serio. La coordenada que cargué para Cadés-Barnea (**Tell el-Qudeirat**, `30.64806, 34.42278`) sigue el consenso arqueológico moderno y está marcada `verificada` + confianza `alta` — el nivel más fuerte que permite el esquema.

**Perspicacia no lo sitúa ahí.** Su entrada «Qadés» reconoce que ʽAin el-Qudeirat es el mayor de los tres manantiales y que "hay quien opta por identificarlo con Qadés-Barnea", pero se decanta por **ʽAin Qedeis**, unos 9 km al sureste, razonando que por ser el manantial más oriental encaja mejor con la descripción de este a oeste del límite meridional de Canaán.

La consecuencia es incómoda y vale la pena verla de frente:

> Bajo el marco de Perspicacia, la coordenada que este atlas etiqueta como **Cadés-Barnea** correspondería en realidad a **Addar / Hazar-Addar**.

Es el mismo punto del mapa con dos nombres, según a qué autoridad se siga. La entrada «Addar» lo dice explícitamente al dar la distancia: 9 km entre Qadés-barnea (ʽAin Qedeis) y Hazar-Addar (ʽAin el-Qudeirat).

**Decisión pendiente del proyecto**, no tomada aquí: si el atlas declara la TNM 2019 + Perspicacia como su marco de referencia, lo coherente sería mover Cadés-Barnea a ʽAin Qedeis y dejar Tell el-Qudeirat como Addar. Mientras tanto la coordenada se mantiene donde estaba, con la divergencia documentada en el campo `advertencia` del registro, visible en el popup.

> **Nota de procedencia:** estas entradas se consultaron vía búsqueda en wol.jw.org; `wol.jw.org` devuelve 403 a la descarga directa, así que **no se ha cotejado el texto impreso de Perspicacia vol. 2**. Todos los campos afectados lo declaran. Ninguna coordenada nueva se cargó a partir de esta consulta.

---

## 6. Por qué Hezrón, Addar, Carcá y Azmón quedan sin coordenada

Los cuatro comparten el mismo problema: **múltiples candidatos modernos que se pisan entre sí**, sin que ninguna fuente secular consultada dé un consenso mayoritario.

- **Hezrón:** openbible.info lista 6 identificaciones modernas propuestas para este nombre. Ninguna domina sobre las demás.
- **Addar:** sin propuesta de identificación moderna encontrada; solo se documenta su fusión textual con Hezrón en Números 34:4.
- **Carcá:** aparece una sola vez en toda la Biblia. Alguna fuente secular la asocia con el mismo manantial (el-Qoseimeh) que otra fuente propone para **Azmón** — es decir, dos topónimos bíblicos distintos compitiendo por el mismo sitio moderno. Eso es una señal de que ninguna de las dos propuestas tiene base firme, no una confirmación cruzada.
- **Azmón:** al menos dos manantiales candidatos (ʽAin el-Qoseima / Bir Qusaima, y ʽAin Muweileh). Trumbull propuso el primero; erudición más reciente inclina hacia el segundo, pero sin coordenada citable localizada para éste. Aparece en el mapa bizantino de Madaba (s. VI) como "Asemona", lo que confirma el nombre pero no resuelve la ubicación exacta.

**Decisión del proyecto:** los cuatro quedan `coordenada_estado: "pendiente"`, sin `geometry`. El motor los interpola automáticamente entre Cadés-Barnea (ancla este) y el torrente de Egipto (ancla oeste), con halo de incertidumbre proporcional a esa distancia — la misma solución de "punto inferido por secuencia" que ya usa el límite norte para sus 🔴.

Ninguna de estas cuatro coordenadas se completó "a ojo" ni por lectura de mapa: donde no hubo fuente citable con un número concreto, el registro se dejó pendiente, tal como exige `docs/metodologia-fuentes.md`.

---

## 7. La bahía sur del mar Salado y el desierto de Zin

Ambos son rasgos geográficos (`render: "zona"`), no puntos, igual que "El Arabá" en el límite norte.

- **Bahía sur ("la lengua"):** los comentaristas no coinciden en qué accidente exacto es "la lengua" (*lashón*) de Josué 15:2 — un promontorio rocoso, un banco de sal, o simplemente el extremo sur del mar Muerto. Se deja sin coordenada hasta encontrar una fuente que fije el punto exacto, en vez de adivinar entre las lecturas propuestas.
- **Desierto de Zin:** región amplia (incluye el entorno de Cadés-Barnea), no un punto ni un polígono definido en las fuentes consultadas. Pendiente de trazar cuando haya una fuente para sus límites.

---

## 8. Fuentes consultadas

Todas las búsquedas se hicieron con WebSearch (agosto de 2026). Nunca se usó una captura de mapa ni una imagen generada por IA como fuente de coordenadas — solo texto de gacetas geográficas, Wikipedia/Wikidata y bibliografía arqueológica citada.

- [Tell el-Qudeirat — Wikipedia](https://en.wikipedia.org/wiki/Tell_el-Qudeirat)
- [Ma'ale Akrabim massacre — Wikipedia](https://en.wikipedia.org/wiki/Ma%27ale_Akrabim_massacre) (coordenadas del paso)
- [Route 227 (Israel) — Wikipedia](https://en.wikipedia.org/wiki/Route_227_(Israel))
- [Wadi al-Arish — Wikipedia](https://en.wikipedia.org/wiki/Wadi_al-Arish)
- [Brook of Egypt — Wikipedia](https://en.wikipedia.org/wiki/Brook_of_Egypt)
- [Akrabbim — Wikipedia](https://en.wikipedia.org/wiki/Akrabbim)
- [Where is biblical Hezron today? — openbible.info](https://www.openbible.info/geo/ancient/ad5c4a1/hezron)
- [Where is biblical Hazar-addar today? — openbible.info](https://www.openbible.info/geo/ancient/a3f301c/hazar-addar)
- [Where is biblical Azmon today? — openbible.info](https://www.openbible.info/geo/ancient/a8f6a28/azmon)
- [Azmon — Wikipedia](https://en.wikipedia.org/wiki/Azmon)
- [Karkaa — Wikipedia](https://en.wikipedia.org/wiki/Karkaa)
- [Bir Qusaima — geoview.info](https://eg.geoview.info/bir_qusaima,350416) (candidato secular para Azmón, no usado como coordenada final)
- [The southern border of Judah and Kadesh Barnea — bible.ca](https://www.bible.ca/archeology/bible-archeology-exodus-kadesh-barnea-southern-border-judah-territory.htm)
- Josué 15:1-4 y Números 34:3-5, Traducción del Nuevo Mundo 2019 (wol.jw.org, vía búsqueda — texto citado, no coordenadas)
- Josué 15:3, Reina-Valera 1960 (para grafías alternas)

---

## 9. Pendientes de la próxima tanda

**Con candidato pero sin coordenada citable localizada:**
- Azmón (ʽAin Muweileh, si se localiza una coordenada específica)

**Sin ninguna propuesta de identificación encontrada:**
- Hezrón
- Addar
- Carcá

**Rasgos geográficos sin polígono:**
- Bahía sur del mar Salado
- Desierto de Zin

**Fuera del alcance de esta tanda** (recordatorio, no se tocó): el límite oeste de Judá (Jos 15:11-12, la franja costera completa) sigue pendiente por separado.

---

## 10. Control de versiones

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | 03-08-2026 | Tabla inicial del tramo 4 (segmento sur). 9 registros: 2 verificados, 1 provisional, 6 pendientes. Documentada la fusión Hezrón/Addar↔Hazar-Addar entre Josué 15 y Números 34. |
