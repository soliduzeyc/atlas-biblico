# Atlas bíblico — Esquema de datos y reglas de render (v2.0)

**Proyecto:** Atlas bíblico interactivo
**Módulo:** Límite Judá–Benjamín (Josué 15 / Josué 18)
**Fecha:** 28 de julio de 2026
**Reemplaza:** secciones 9 y 10 de `limite-juda-benjamin-v1.md`

---

## 1. Problema 1 — Las grafías

### 1.1 Qué pasó

Un mismo lugar aparece escrito de formas distintas según la traducción y la obra de consulta:

- **TNM 2019:** Quiryat-Jearim, En-Roguel, Neftóah
- **Perspicacia (1988):** Quiriat-jearim, En-roguel, llanura baja de Refaím
- **Tradición española (RV60, NBLA, LBLA, NVI):** Quesalón, Sicrón, Adumín, Bet-hogla

Esto rompe dos cosas: la búsqueda en wol.jw.org y el cruce de datos entre fuentes.

### 1.2 Solución rechazada

Una tabla de equivalencias "antiguo → nuevo". **Se descarta** porque obligaría a inventar grafías no verificadas para completar la columna.

### 1.3 Solución adoptada

Un campo **`aliases[]`** en cada registro. Guarda todas las variantes documentadas, cada una con su procedencia. Nada se adivina: si una variante no está verificada, no entra.

```json
"nombre": "Quiryat-Jearim",
"aliases": [
  { "forma": "Quiriat-jearim", "fuente": "Perspicacia" },
  { "forma": "Quiriat Yearín",  "fuente": "NVI" },
  { "forma": "Quiryat-Baal",    "fuente": "TNM 2019, Jos 18:14" },
  { "forma": "Baalá",           "fuente": "TNM 2019, Jos 15:9" }
]
```

**Consecuencia práctica:** el buscador de la app indexa `nombre` **y** todos los `aliases[].forma`. Si escribes "Sicrón" o "Sikerón", encuentras el mismo registro.

---

## 2. Problema 2 — Los lugares de ubicación desconocida (🔴)

### 2.1 El dilema

- Dibujarlos como punto normal = **mentir**. El atlas afirmaría algo que la evidencia no sostiene.
- Omitirlos = **mutilar el texto**. Josué 15 los menciona; el usuario que lee el capítulo va a buscarlos y no los va a encontrar.

### 2.2 La observación que resuelve el problema

La frontera **no es una nube de puntos: es una ruta ordenada**.

Aunque no sepamos *dónde* está Sikerón, el texto sí nos dice con certeza *entre qué dos lugares* va: después de la ladera norte de Ecrón y antes del monte Baalá.

**Esa información posicional es un dato real y verificable.** Es lo que hay que representar.

### 2.3 Solución adoptada — "punto inferido por secuencia"

1. Cada registro lleva un campo `orden` (su posición en la ruta).
2. Para un 🔴, se calcula una posición provisional **interpolando** sobre la línea entre los dos anclajes verificados más cercanos.
3. Se dibuja como **marcador hueco con borde punteado** — visualmente distinto de un punto sólido.
4. Alrededor lleva un **halo de incertidumbre** translúcido. El radio se calcula en proporción a la distancia entre los anclajes: mientras más lejos están, menos sabemos, más grande el halo.
5. El popup **siempre** dice explícitamente que la posición es inferida y por qué.
6. Aparece **siempre** en el panel lateral, aunque el usuario oculte los inferidos en el mapa.

**Resultado:** el usuario ve que el lugar existe, ve aproximadamente dónde encaja en la secuencia, y no puede confundirlo con un dato firme.

### 2.4 Regla de oro

> Un punto sólido en el mapa es una afirmación. Solo se dibuja sólido lo que se puede sostener con fuente citada.

---

## 3. Los tres modos de render

| Modo | Cuándo se usa | Geometría | Aspecto visual |
|---|---|---|---|
| `punto` | Coordenada con fuente citada | `Point` | Marcador sólido, color por confianza |
| `zona` | Rasgo geográfico con extensión, no un punto (valles, laderas, el Arabá, llanura de Refaím) | `Polygon` o `LineString` | Relleno translúcido, sin marcador |
| `inferido` | Ubicación desconocida, posición deducida de la secuencia | `Point` (calculado) | Marcador hueco, borde punteado, halo de incertidumbre |

**Códigos de color por confianza:**

| Confianza | Color | Uso |
|---|---|---|
| `alta` | Verde | Consenso o identificación firme citada |
| `media` | Ámbar | Propuesta fundada, declarada como probable |
| `baja` | Gris | Discutida o desconocida → siempre `inferido` o `zona` |

> El gris es deliberado: no es un color de alerta, es un color de ausencia. Comunica "no sabemos" sin dramatizar.

---

## 4. Esquema del registro

Cada lugar es un `Feature` de GeoJSON. Campos de `properties`:

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `id` | string | ✅ | Identificador estable, minúsculas, sin tildes. Ej: `en-roguel` |
| `nombre` | string | ✅ | Forma de la TNM 2019 |
| `aliases` | array | ✅ | Variantes documentadas. Puede ir vacío, nunca ausente |
| `identificacion` | string \| null | ✅ | Sitio moderno propuesto. `null` si no hay |
| `confianza` | enum | ✅ | `alta` \| `media` \| `baja` |
| `fuente` | string \| null | ✅ | De dónde sale la identificación. Sin fuente → `null` y confianza `baja` |
| `render` | enum | ✅ | `punto` \| `zona` \| `inferido` |
| `coordenada_estado` | enum | ✅ | `verificada` \| `provisional` \| `pendiente` \| `no_aplica`. Ver 4.4 |
| `precision` | enum \| null | ✅ | `sitio` \| `localidad` \| `null`. Ver 4.2 |
| `fuente_coordenada` | string \| null | ✅ | Solo si `coordenada_estado` = `verificada` |
| `referencias` | array | ✅ | Versículos. Ej: `["Jos 15:7", "Jos 18:17"]` |
| `tramo` | int | ✅ | 1, 2 o 3 |
| `orden` | int | ✅ | Posición en la ruta este→oeste. Base del cálculo de inferidos |
| `pertenece_a` | array | ✅ | `["juda"]`, `["juda","benjamin"]` |
| `nota` | string \| null | — | Detalle topográfico útil |
| `advertencia` | string \| null | — | Aviso al usuario (ej. homónimos) |

### 4.2 El campo `precision`

Tener coordenada no significa tener buena coordenada. Se distinguen dos calidades:

| Valor | Significado | Render |
|---|---|---|
| `sitio` | Coordenada del yacimiento arqueológico mismo | Punto sólido limpio |
| `localidad` | Coordenada del pueblo moderno que contiene o vecina al sitio | Punto sólido + anillo de imprecisión |
| `null` | Sin coordenada | No aplica |

**Por qué importa.** Quiryat-Jearim tiene coordenada de Abu Ghosh (la localidad), no del tel de Deir el-ʽAzar. Kesalón tiene la del moshav Ksalon, pero el tel real está más al norte, en la aldea árabe de Kasla destruida en 1948. Ambas sirven como anclaje para interpolar, pero no deben presentarse con la misma autoridad que Tel Batash o Tel Miqne.

### 4.4 El estado `provisional` (añadido en v3.0)

Una coordenada puede llegar sin fuente confirmada pero pasar todas las pruebas de coherencia. No es verificada, pero tampoco es nada. Ese es el estado `provisional`.

| Estado | Significado | Render |
|---|---|---|
| `verificada` | Coordenada con fuente citable | `punto` sólido |
| `provisional` | Sin fuente confirmada, pero valida contra el control geométrico | `inferido` **con** geometría |
| `pendiente` | Sin coordenada | `inferido` sin geometría (se interpola) |

**Convención clave:** `render: "inferido"` + `geometry` presente significa *"dibuja el marcador hueco EN esta posición, no la interpoles"*. La posición provisional es mejor que la interpolada, pero sigue sin merecer un punto sólido.

Promover de `provisional` a `verificada` requiere una confirmación directa con fuente. Es un clic por punto, no un rediseño.

### 4.5 El control geométrico

Cuando no hay fuente citable, la propia estructura del dato permite validar. Pruebas aplicadas a este módulo:

1. **Monotonía de longitud.** La frontera va de este a oeste. Ordenados por `orden`, los puntos deben tener longitud estrictamente decreciente. Un retroceso delata un error.
2. **Contraste con descripciones textuales.** Si la fuente dice "unos 500 m al sur de X", se mide. En-Roguel dio 523 m al sur de la Ciudad de David.
3. **Distancias entre consecutivos.** Saltos coherentes con la escala del terreno; un salto anómalo señala confusión con un homónimo.
4. **Restricciones posicionales del texto.** En-Semes debe caer entre Adumim y En-Roguel. Se comprueba.

Esto no sustituye a la fuente. Detecta el error grosero, no el error sutil.

### 4.6 Lección operativa: no poner ejemplos rellenables en hojas de campo

En la v2.3 la hoja de campo incluía un ejemplo de formato con coordenadas ficticias. Al delegar el levantamiento a un asistente externo, tres de esas líneas volvieron como si fueran hallazgos, con explicaciones elaboradas de cómo se habían localizado.

**Regla para futuras hojas de campo:** los ejemplos de formato usan valores imposibles y evidentes (`0.00000, 0.00000`, o `[LON, LAT]`), nunca números plausibles.

### 4.7 El campo `lectura_alternativa` (añadido en v6.0)

A veces el problema no es que falte una fuente, sino que hay **dos fuentes citadas que no coinciden**. Caso real: Cadés-Barnea. El consenso arqueológico moderno lo sitúa en Tell el-Qudeirat; Perspicacia se decanta por ʽAin Qedeis, 9 km al sureste.

Elegir una y callar la otra sería el mismo pecado que dibujar un punto sin fuente: el atlas afirmaría algo que la evidencia no zanja. Así que se dibujan **las dos, unidas por una línea**. La longitud de esa línea *es* el desacuerdo.

```json
"lectura_alternativa": {
  "etiqueta": "Lectura de Perspicacia",
  "identificacion": "ʽAin Qedeis",
  "fuente": "Perspicacia, entrada 'Qadés' (…)",
  "coordenada_estado": "derivada",
  "geometry": { "type": "Point", "coordinates": [34.45874, 30.57337] },
  "derivacion": {
    "distancia_km": 9,
    "rumbo_grados": 157.5,
    "radio_halo_m": 2500,
    "fuente_distancia": "Perspicacia, entrada 'Addar': 9 km entre …"
  },
  "nota": "ESTA POSICIÓN NO ES UNA COORDENADA CITADA. …"
}
```

**El estado `derivada`.** Es un cuarto estado, y el más débil de todos. Significa: *no existe coordenada publicada para este sitio, pero sí una restricción citable* — aquí, la distancia que da la propia Perspicacia. La posición se calcula desde el ancla y se dibuja hueca, con halo, y con un popup que empieza diciendo que no es un dato.

No confundir con `pendiente`: aquel interpola entre dos vecinos de la secuencia; este se calcula a partir de una cifra citada en la fuente.

**Consecuencia lógica que hay que dejar escrita.** Si la lectura alternativa fuese la correcta, la coordenada verificada del registro pertenecería a *otro* topónimo — en este caso, a Addar/Hazar-Addar. Eso va en `nota`, porque un desacuerdo sobre un nombre casi siempre arrastra al vecino.

### 4.3 Regla de integridad

```
si fuente == null        → confianza DEBE ser "baja"
si confianza == "baja"   → render DEBE ser "inferido" o "zona"
si render == "punto"     → coordenada_estado DEBE ser "verificada"
si geometry == null      → render NO puede ser "punto"
```

Estas cuatro reglas se validan en build. Si una falla, el build se cae. **No se despliega data que se contradiga a sí misma.**

---

## 5. Sobre `geometry: null`

Un `Feature` con `"geometry": null` es **GeoJSON válido** según la especificación (RFC 7946). No es un error ni un parche.

Es exactamente la forma correcta de decir: *"este lugar existe y está documentado, pero todavía no tiene posición asignada"*.

El renderizador lee `geometry: null` + `render: "inferido"` y calcula la posición provisional en tiempo de dibujo. **La posición inferida nunca se guarda en el archivo de datos** — se calcula al vuelo. Así el dato crudo se mantiene honesto y el día que aparezca una coordenada real, solo se rellena `geometry` y el punto pasa a sólido sin tocar nada más.

---

## 6. Algoritmo de interpolación (pseudocódigo)

```
para cada lugar con render == "inferido":
    anclaAntes  = buscar hacia atrás el lugar más cercano con geometry != null
    anclaDespues = buscar hacia adelante el lugar más cercano con geometry != null

    si no hay alguno de los dos:
        no dibujar en el mapa
        mostrar solo en panel lateral con nota "sin anclaje"
        continuar

    pasosTotales = anclaDespues.orden - anclaAntes.orden
    pasoActual   = lugar.orden - anclaAntes.orden
    t = pasoActual / pasosTotales

    posicion = interpolar(anclaAntes.geometry, anclaDespues.geometry, t)
    radioHalo = distancia(anclaAntes, anclaDespues) * 0.35

    dibujar marcador hueco en posicion
    dibujar circulo translucido de radio radioHalo
```

**Nota:** el factor `0.35` es un punto de partida. Ajustar visualmente cuando haya coordenadas reales cargadas.

---

## 7. Estado actual de las coordenadas

Solo **2 de 27** registros tienen coordenada con fuente citada en esta versión:

| Lugar | Coordenada | Fuente |
|---|---|---|
| Bet-Hoglá | 31.82028, 35.50194 | Deir Hajla (ficha geográfica) |
| Neftóah | 31.79528, 35.19639 | Lifta (ficha geográfica) |

Los otros 25 van con `geometry: null`.

**Esto es deliberado.** Tengo identificación de sitio para varios más (Bir Ayyub, Deir el-ʽAzar, Tel Miqne, Yavne…), pero no coordenada verificada contra fuente. Cargarlas de memoria sería exactamente el tipo de error que este esquema existe para prevenir.

La siguiente tanda es levantar esas coordenadas una por una con fuente.

---

## 8. Control de versiones

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | 28-07-2026 | Tabla de 27 lugares. 6 verificados en Perspicacia |
| 2.0 | 28-07-2026 | Resuelto el problema de grafías con `aliases[]`. Definidos 3 modos de render. Añadido "punto inferido por secuencia" para los 🔴. Reglas de integridad validadas en build |

**Siguiente:** coordenadas verificadas para los 25 pendientes.
