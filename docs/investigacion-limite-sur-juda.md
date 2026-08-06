# Límite sur de Judá — Investigación de coordenadas

**Pasaje base:** Josué 15:1-4 (TNM 2019)
**Pasaje paralelo:** Números 34:3-5 (frontera sur de Canaán, prácticamente idéntica)
**Fuentes primarias:** TNM 2019 · *Perspicacia para comprender las Escrituras* (1988), artículos «Cades», «Addar», «Azmón»

---

## 1. El hallazgo que domina este tramo

*Perspicacia* y el consenso académico mayoritario **usan los mismos tres manantiales del Neguev pero les asignan nombres bíblicos intercambiados.**

| Manantial (nombre árabe) | Coordenada | *Perspicacia* (1988) | Consenso académico |
|---|---|---|---|
| ʽAin Qedeis | 30.583378, 34.484081 | **Cades-barnea** | Hazar-adar |
| ʽAin el-Qudeirat / Tell el-Qudeirat | 30.64806, 34.42278 | **Hazar-adar** | **Cades-barnea** |
| ʽAin el-Qeseimeh / ʽAin Qoseimeh | 30.666667, 34.366667 | **Azmón** | Carca (Azmón: confianza muy baja) |

**Argumento de *Perspicacia*:** ʽAin Qedeis es el manantial más oriental, y eso encaja mejor con el recorrido este→oeste que describe Números 34:3-5. Además observa que, dada la multitud, los israelitas probablemente usaron los tres manantiales, y que quizá toda la zona se llamaba Cades-barnea.

**Argumento académico:** Tell el-Qudeirat es el manantial más grande del Sinaí en 100 km a la redonda y tiene tres fortalezas superpuestas de la Edad del Hierro excavadas (Dothan 1956; Cohen 1976-1982, IAA Reports 44). La identificación se impuso a partir de 1916.

**Decisión adoptada:** el proyecto sigue a *Perspicacia* como fuente primaria, y registra la lectura académica en el campo `identificacion_disputada` de cada registro afectado. Ningún punto de este tramo se presenta como definitivo.

---

## 2. Validación geométrica (la prueba que da confianza)

*Perspicacia* declara distancias explícitas entre los manantiales. Al calcularlas con las coordenadas obtenidas de fuentes independientes (OpenBible.info, Wikipedia, Wikidata):

| Par | *Perspicacia* declara | Calculado (haversine) | Resultado |
|---|---|---|---|
| Cades-barnea → Hazar-adar | ~9 km | **9.28 km** | ✅ |
| Cades-barnea → Azmón | ~14 km | **14.56 km** | ✅ |

Además la longitud decrece de forma monótona este→oeste (34.484 → 34.423 → 34.367), consistente con la dirección del recorrido descrito en el texto.

**Conclusión:** las coordenadas son correctas y *Perspicacia* trabajaba con estos mismos sitios. Lo disputado no son las coordenadas — es la asignación de nombres bíblicos.

---

## 3. Registro por lugar (orden del texto, este → oeste)

### 1. Extremo del mar Salado, «la bahía que da al sur» (Jos 15:2)
`zona` · confianza **baja** · **sin trazar**

No trazado deliberadamente. La cuenca sur del mar Muerto se secó en los años setenta y hoy son piscinas de evaporación industrial. Dibujar la línea de costa moderna como «la bahía que da al sur» sería un anacronismo grave: el texto describe una masa de agua que ya no existe con esa forma. Requiere una fuente de paleo-línea de costa antes de dibujarse.

### 2. Subida de Acrabim (Jos 15:3; Nm 34:4; Jue 1:36)
`punto` · confianza **provisional** · precisión **localidad**
**30.90667, 35.13167** — Wikidata Q7371401 / GNS Feature ID -779224

Corresponde al paso moderno de la ruta 227, entre el valle del Arabá y la meseta central del Néguev. **Advertencia registrada:** historicalsitesinisrael.com señala que las fuentes, incluida la Biblia, solo permiten una determinación general de la zona, no una ubicación exacta. Tratar como referencia de zona.

### 3. Desierto de Zin (Jos 15:1, 3)
`zona` · confianza **baja** · **sin trazar**

Región, no punto. Falta fuente citable de su extensión.

### 4. Cades-barnea (Jos 15:3; Nm 34:4; Dt 1:19)
`punto` · confianza **provisional** · precisión **sitio**
**30.583378, 34.484081** (ʽAin Qedeis) — OpenBible.info, precisión declarada 100 m

Alias: Meribá-cades (Nm 27:14), En-mispat (Gn 14:7).
Alternativa académica registrada: 30.64806, 34.42278 (Tell el-Qudeirat).

### 5. Hezrón (Jos 15:3; Nm 34:4)
`inferido` · confianza **baja**

Sin identificación propia. Varias obras de referencia lo consideran probablemente el mismo lugar que Hazar-adar. Se interpola entre Cades-barnea y Adar.

### 6. Adar / Hazar-adar (Jos 15:3; Nm 34:4)
`punto` · confianza **provisional** · precisión **sitio**
**30.64806, 34.42278** (ʽAin el-Qudeirat) — Wikipedia «Tell el-Qudeirat»

La coordenada es sólida; lo disputado es qué nombre bíblico le corresponde.

### 7. Carca (Jos 15:3)
`inferido` · confianza **baja**

Holman Illustrated Bible Dictionary: ubicación precisa desconocida. **Conflicto de fuentes:** OpenBible.info asigna ʽAin Qoseimeh a Carca con confianza media, pero *Perspicacia* asigna ese mismo manantial a Azmón. Como el proyecto sigue a *Perspicacia*, Carca queda sin coordenada y se interpola.

### 8. Azmón (Jos 15:4; Nm 34:4, 5)
`punto` · confianza **provisional** · precisión **localidad**
**30.666667, 34.366667** (ʽAin Qoseimeh) — OpenBible.info

Precisión «localidad» porque OpenBible declara la coordenada como punto dentro del asentamiento moderno, no del yacimiento. El ESV Archaeology Study Bible admite dos candidatos: Ain Qoseimeh o Ain Muweilih.

### 9. Valle torrencial de Egipto (Jos 15:4; Nm 34:5)
`zona` · confianza **provisional**
Desembocadura: **31.14571, 33.80649** — Wikidata Q10719024

Alias: Wadi el-Arish, arroyo/torrente de Egipto, Rinocorura (Septuaginta, Is 27:12).
**Trazo esquemático, no el cauce real:** la línea une Azmón con la desembocadura sin seguir los meandros del wadi (cauce real: ~250 km). Reemplazar cuando se consiga la geometría real.
**Disidencia registrada:** Nadav Naaman propone el arroyo Besor, al sur de Gaza, en lugar del Wadi el-Arish.

### 10. Mar Grande (Jos 15:4, 12)
`zona` · confianza **provisional**

Terminal occidental. Ya existe un trazo parcial en el archivo del límite norte. La costa entre la desembocadura del Wadi el-Arish y el límite oeste de Judá queda pendiente de unificar en un solo segmento continuo.

---

## 4. Fuentes rechazadas (registro de trampas evitadas)

| Fuente descartada | Motivo |
|---|---|
| Coordenadas leídas de la lámina «Tribus y jueces» del folleto *gl* (2003) | Los mapas de las publicaciones son referencia visual, nunca fuente numérica. Confirmaron cualitativamente que Qadés y Azmón están en el extremo sur; nada más. |
| Línea de costa moderna de la cuenca sur del mar Salado | La cuenca se secó en los años setenta; hoy son piscinas de evaporación industrial. Sería un anacronismo. |

---

## 5. Estado del tramo

| Confianza | Cantidad |
|---|---|
| Verificada | 0 |
| Provisional | 5 |
| Baja (inferido / zona sin trazar) | 5 |
| **Total** | **10** |

Las cuatro reglas de integridad del esquema pasan sin errores.

**Pendientes concretos de este tramo:**
1. Paleo-línea de costa de la cuenca sur del mar Salado (para trazar la bahía).
2. Polígono del desierto de Zin.
3. Geometría real del cauce del Wadi el-Arish.
4. Resolver si Carca merece coordenada propia o permanece inferido.
5. Unificar el segmento costero del Mar Grande con el del límite norte.
