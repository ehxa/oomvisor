var map = L.map('map').setView([32.74601, -16.7], 9);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
L.tileLayer.wms('http://localhost:8080/geoserver/oomvisor/wms', {
    layers: 'u_wind',
    format: 'image/png',
    transparent: true,
    opacity: 0.2,
    attribution: 'GeoServer'
}).addTo(map);