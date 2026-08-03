// Capa ilustrativa de los 12 territorios tribales (~1467 a.e.c.).
// A diferencia de map-engine.js, aquí no hay puntos con fuente citable ni
// interpolación: son polígonos orientativos (ver docs/metodologia-fuentes.md,
// sección "Excepción autorizada"). El único territorio con enlace activo es
// Judá, que lleva a la página con los límites investigados con fuente.
import L from 'leaflet';

export async function initTribesMap(root) {
  const geojsonUrl = root.dataset.geojsonUrl;
  const mapEl = root.querySelector('[data-role="map"]');
  const captionEl = root.querySelector('[data-role="caption"]');

  const res = await fetch(geojsonUrl);
  const DATA = await res.json();

  if (captionEl && DATA.metadata?.advertencia_general) {
    captionEl.textContent = DATA.metadata.advertencia_general;
  }

  const map = L.map(mapEl, { zoomControl: true, attributionControl: true, scrollWheelZoom: false })
    .setView([32.1, 35.4], 8);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap · CARTO', subdomains: 'abcd', maxZoom: 12, opacity: .5
  }).addTo(map);

  const layer = L.geoJSON(DATA, {
    style: (f) => ({
      color: f.properties.color,
      weight: 1.5,
      opacity: .8,
      fillColor: f.properties.color,
      fillOpacity: .35
    }),
    onEachFeature: (f, lyr) => {
      const p = f.properties;
      const isJudah = p.id === 'juda';
      lyr.bindTooltip(p.nombre, {
        permanent: true, direction: 'center', className: 'tribe-label' + (isJudah ? ' tribe-label-juda' : ''),
      });
      lyr.on('mouseover', () => lyr.setStyle({ fillOpacity: .55, weight: 2.5 }));
      lyr.on('mouseout', () => lyr.setStyle({ fillOpacity: .35, weight: 1.5 }));
      if (isJudah) {
        lyr.getElement && lyr.getElement()?.classList.add('tribe-juda');
        lyr.bindPopup('<div class="tribe-pop"><strong>Judá</strong><br>Límites investigados con fuente citable.<br><a href="/judah">Ver el mapa detallado →</a></div>');
      } else {
        lyr.bindPopup(`<div class="tribe-pop"><strong>${p.nombre}</strong><br>Territorio ilustrativo — próximamente.</div>`);
      }
    }
  }).addTo(map);

  map.fitBounds(layer.getBounds(), { padding: [24, 24] });
}
