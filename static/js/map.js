const map = L.map('map').setView([32.7607, -16.9595], 8);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

fetch('/t2')
    .then(response => response.json())
    .then(data => {
        const heatmapData = data.map(d => [d.lat, d.lon, d.value-273.15]);
        L.heatLayer(heatmapData, { radius: 20}).addTo(map);
    })
    .catch(error => console.error('Error loading T2 data:', error));