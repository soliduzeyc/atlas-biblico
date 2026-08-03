# Metodología de fuentes — reglas innegociables

- Toda coordenada requiere fuente citable. Sin fuente → confianza "baja" →
  nunca se dibuja como punto sólido.
- Estados válidos: `verificada` (con fuente), `provisional` (sin fuente
  confirmada pero pasa validación geométrica), `pendiente` (sin coordenada,
  se interpola).
- Las imágenes generadas por IA (ChatGPT/Gemini) o los mapas de jw.org
  (Perspicacia, B6, Regiones Naturales) NUNCA son fuente de coordenadas.
  Sirven solo como referencia visual para contrastar, jamás como dato
  numérico a copiar.
- Si en algún momento se delega el levantamiento de coordenadas a otra IA
  (Gemini, ChatGPT, etc.) vía captura de pantalla, hay que revisar el
  resultado contra el texto original antes de aceptarlo: ya pasó una vez
  que una IA copió literalmente un ejemplo de formato ficticio en vez de
  leer coordenadas reales. Los ejemplos de formato en hojas de campo deben
  usar valores imposibles (0.00000), nunca coordenadas plausibles.

## Excepción autorizada — capa ilustrativa de los 12 territorios (3 de agosto de 2026)

La regla de arriba sigue vigente para todo el trabajo de **límites de Judá con
fuente citable** (los tramos norte y sur ya cargados). No se relaja ni se
resume.

El usuario autorizó explícitamente, con conocimiento del conflicto, una
**excepción puntual**: usar el mapa B6 de jw.org (*"La ocupación de la Tierra
Prometida"*, `https://www.jw.org/finder?wtlocale=S&docid=1001070226`) como
base visual para trazar los **12 territorios tribales tal como se repartieron
tras la conquista (1467 a.e.c.)**, en `public/data/tribus-1467-aec.geojson`.

Esta excepción es:

- **Solo para esa capa.** Los polígonos de esa capa son un trazado
  **ilustrativo y aproximado**, no un levantamiento de coordenadas. Cada
  `Feature` de esa capa debe declarar `"precision": "ilustrativa"` y una
  `fuente` que diga explícitamente que viene de una lectura visual del B6,
  no de una fuente numérica citable.
- **No aplica** a ningún dato de Judá con `coordenada_estado` verificada,
  provisional o pendiente en `judah-benjamin-limite.geojson`: esos siguen
  la regla original sin excepción.
- **No se extiende sola.** Si en el futuro se quiere usar el B6 (o cualquier
  mapa de jw.org) para otra cosa, hay que pedir autorización de nuevo — esto
  no reabre la puerta de forma general.
