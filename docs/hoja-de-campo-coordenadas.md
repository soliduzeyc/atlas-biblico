# Hoja de campo — Levantamiento manual de coordenadas

**Proyecto:** Atlas bíblico — Límite Judá–Benjamín
**Para:** Soli
**Fecha:** 28 de julio de 2026
**Archivo destino:** `limite-juda-benjamin.geojson`

---

## ⚠️ ANTES DE EMPEZAR — lee esto

### El error número uno: el orden de las coordenadas

Google Maps y OpenStreetMap te dan **latitud, longitud**.
GeoJSON las guarda al revés: **longitud, latitud**.

```
Google Maps te muestra:   31.7686, 35.2361
GeoJSON necesita:       [ 35.2361, 31.7686 ]
                          ↑ lon    ↑ lat
```

Si las inviertes, el punto se va a Somalia. Literalmente: latitud 35 / longitud 31 cae en el mar cerca del cuerno de África. Es el bug clásico de GeoJSON y no da error, solo dibuja mal.

**Regla mnemotécnica:** en GeoJSON va primero el número más grande (aquí siempre ~35, la longitud).

### Cómo sacar la coordenada

**Google Maps:** clic derecho sobre el punto exacto → aparecen los números arriba del menú → clic para copiar.
**OpenStreetMap:** clic derecho → "Mostrar dirección aquí", o mirar la URL después de hacer zoom (`#map=17/31.7686/35.2361`).

### Precisión: 5 decimales bastan

5 decimales ≈ 1 metro. Más es ruido. Redondea.

---

## Parte A — Los 6 puntos que faltan

### A1. En-Roguel → Bir Ayyub
**id:** `en-roguel` · **Tramo 1** · Confianza alta

| | |
|---|---|
| **Buscar** | "Bir Ayyub" o "Job's Well" Jerusalén |
| **Qué es** | Un pozo, no un edificio grande. Está en el fondo del valle |
| **Cómo confirmar** | Debe caer unos 500 m al SUR de la Ciudad de David, cerca de donde se juntan el valle de Cedrón y el valle de Hinón, al pie de la margen OESTE del Cedrón. Barrio de Silwán |
| **NO confundir con** | El manantial de Guihón / Fuente de la Virgen. Está más al norte y es otro sitio. Perspicacia y 1 Reyes 1 dejan claro que son dos manantiales distintos |

**Coordenada:** `lat: __________  lon: __________`

---

### A2. Bet-Semes → Tell er-Rumeileh
**id:** `bet-semes` · **Tramo 3** · Confianza media

| | |
|---|---|
| **Buscar** | "Tel Beit Shemesh" o "Tel Beth Shemesh" (parque arqueológico) |
| **Qué es** | Montículo bajo de unas 3 hectáreas sobre el valle de Sorek |
| **Cómo confirmar** | Está al OESTE de la ciudad moderna de Bet Semes. La carretera 38 corta el yacimiento en dos: montículo occidental (el más excavado) y oriental. Toma el punto del **montículo occidental** |
| **NO confundir con** | La ciudad moderna de Beit Shemesh, que es grande y está al este |

**Coordenada:** `lat: __________  lon: __________`

---

### A3. En-Semes → ʿAin el-Hod
**id:** `en-semes` · **Tramo 1** · Confianza media

| | |
|---|---|
| **Buscar** | "Ein Hod" spring, o "ʿAin el-Hod", cerca de la carretera Jerusalén–Jericó |
| **Qué es** | Un manantial. Nombre bíblico: "Fuente del Sol" |
| **Cómo confirmar** | Debe quedar ENTRE la subida de Adumim (al este) y En-Roguel (al oeste). Si el punto no cae en ese corredor, es otro sitio |
| **NO confundir con** | Ein Hod, la aldea de artistas cerca de Haifa. Está a 100 km, en el norte. Nombre casi idéntico |

**Coordenada:** `lat: __________  lon: __________`

---

### A4. Subida de Adumim → Talʽat ed-Damm
**id:** `subida-de-adumim` · **Tramo 1** · Confianza alta

| | |
|---|---|
| **Buscar** | "Maale Adumim" ascent, o el Khan al-Hatruri / Posada del Buen Samaritano |
| **Qué es** | Un paso de subida en la carretera antigua Jerusalén–Jericó. Es un tramo de camino, no un punto |
| **Cómo confirmar** | Suelo rojizo, rico en ocre — de ahí el nombre "Subida de Sangre". El museo del Buen Samaritano marca el paso histórico |
| **NO confundir con** | La ciudad moderna de Ma'ale Adumim, fundada en 1975. Toma el punto del **paso antiguo**, no del centro urbano |

**Coordenada:** `lat: __________  lon: __________`

---

### A5. Bet-Arabá → ʿAin el-Gharabeh
**id:** `bet-araba` · **Tramo 1** · Confianza media

| | |
|---|---|
| **Buscar** | "Ain el-Gharabeh" o "Ein el-Gharaba", cerca de Jericó |
| **Qué es** | Un manantial en la depresión del Jordán |
| **Cómo confirmar** | Debe quedar cerca de Bet-Hoglá (que ya está cargado: 31.82028, 35.50194). Si sale muy lejos de ahí, revisa |
| **Si no lo encuentras** | Es probable. Es un topónimo árabe antiguo que puede no estar en los mapas actuales. Déjalo pendiente antes que forzarlo |

**Coordenada:** `lat: __________  lon: __________`

---

### A6. Ladera de los jebuseos → Ciudad de David
**id:** `ladera-jebusea-jerusalen` · **Tramo 2** · Confianza alta

| | |
|---|---|
| **Buscar** | "City of David" / "Ciudad de David" parque arqueológico, Jerusalén |
| **Qué es** | La colina sur, fuera de las murallas actuales de la Ciudad Vieja |
| **Cómo confirmar** | Está al SUR del Monte del Templo, sobre la ladera occidental del valle de Cedrón, encima de Silwán |
| **Ojo** | El texto habla de la LADERA SUR de la ciudad. Si quieres precisión, toma el extremo sur del yacimiento, no el centro |

**Coordenada:** `lat: __________  lon: __________`

---

## Parte B — Los 3 refinamientos (opcional, mejora la precisión)

Estos ya tienen coordenada de localidad. Si consigues la del sitio arqueológico, sube de `precision: "localidad"` a `precision: "sitio"`.

### B1. Quiryat-Jearim → Deir el-ʽAzar
Buscar: **Monasterio de Nuestra Señora del Arca de la Alianza** (Notre Dame de l'Arche d'Alliance), Abu Ghosh. El tel está en esa colina.
Actual: `35.11083, 31.80472` (centro de Abu Ghosh)

**Nueva:** `lat: __________  lon: __________`

### B2. Kesalón → tel de Kasla
Buscar: el tel está **al NORTE** del moshav Ksalon, en el emplazamiento de la aldea árabe de Kasla, destruida en 1948. Busca la ruina en alto, sobre la ladera que domina el wadi.
Actual: `35.04944, 31.77389` (moshav moderno — **no es el sitio**)

**Nueva:** `lat: __________  lon: __________`

### B3. Jabneel → Tel Yavne
Buscar: "Tel Yavne", el montículo con la estructura mameluca en alto, dentro de la ciudad de Yavne.
Actual: `34.733, 31.883` (centro de la ciudad)

**Nueva:** `lat: __________  lon: __________`

---

## Parte C — Cómo me lo devuelves

Cualquiera de estas dos formas sirve:

**Opción 1 — lista simple (más fácil)**
```
en-roguel: 31.76860, 35.23610
bet-semes: 31.75170, 34.97560
en-semes: no lo encontré
...
```

**Opción 2 — ya en formato GeoJSON**
```json
"geometry": { "type": "Point", "coordinates": [35.23610, 31.76860] }
```

Yo hago la carga, invierto el orden si hace falta, actualizo `precision` y `fuente_coordenada`, y vuelvo a correr la validación de integridad.

---

## Parte D — Si no encuentras alguno

**Déjalo en blanco.** No lo aproximes "a ojo".

El esquema está diseñado para funcionar con huecos: el punto se dibuja como inferido entre sus dos anclajes vecinos y el usuario ve que es una posición deducida. Eso es correcto. Un punto sólido en el lugar equivocado, no.

Los que ya tenemos cubren los tres tramos, así que la interpolación va a funcionar aunque falten varios.

---

## Anexo — Trampas ya detectadas y descartadas

Guardadas en `metadata.coordenadas_rechazadas` del GeoJSON. Si alguna te aparece en el buscador, ya sabemos que no va:

| Candidato | Por qué NO |
|---|---|
| Kiryat Ye'arim / Telz-Stone | Localidad moderna del siglo XX, no el tel |
| Kiryat Ekron | Perpetúa un error del Mandato británico. Ecrón real = Tel Miqne, ~10 km al sur |
| Yavne'el | Está en Galilea. Es el Jabneel de Neftalí (Jos 19:33) |
| Yavne-Yam | Puerto costero, yacimiento distinto |
| Gan Yavne | Localidad moderna de 1931, sin relación |

---

**Estado al cerrar esta hoja:** 7 de 27 coordenadas verificadas. 6 puntos + 3 refinamientos en esta hoja. El resto son zonas (polígonos), que van en una tanda aparte.
