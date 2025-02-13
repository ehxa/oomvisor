const map = L.map('map').setView([32.7607, -16.9595], 8);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

let heatLayer=null;

function updateHeatmap(timeIndex) {
    document.getElementById('time').textContent = formatTime(timeIndex); 
    fetch(`/t2/${timeIndex}`)
        .then(response => response.json())
        .then(data => {
            if (heatLayer) {
                map.removeLayer(heatLayer);
            }
            const heatmapData = data.map(d => [d.lat, d.lon, d.value - 273.15]);
            heatLayer = L.heatLayer(heatmapData, { radius: 20, minOpacity: 0.5 }).addTo(map);
        })
        .catch(error => console.error('Error loading T2 data for this time:', error));
}

function formatTime(index) {
    const date = new Date(2023, 0, 1, 0, 0, 0);
    date.setHours(date.getHours() + index);
    return date.toLocaleString('pt-PT', { timeZone: 'UTC' });
}

function removeHeatmap() {
    if (heatLayer) {
        map.removeLayer(heatLayer);
        heatLayer = null;
    }
    else {
        updateHeatmap(0);
    }
}

function navigateTime(step) {
    const slider = document.getElementById('timeSlider');
    let newValue = parseInt(slider.value) + step;
    
    if (newValue < parseInt(slider.min)) {
        newValue = parseInt(slider.max);
    } else if (newValue > parseInt(slider.max)) {
        newValue = parseInt(slider.min);
    }
    
    slider.value = newValue;
    updateHeatmap(newValue);
}

function playTime() {
    const slider = document.getElementById('timeSlider');
    if (slider.value == slider.max) {
        slider.value = slider.min;
        updateHeatmap(slider.min);
    }
    for (let i = parseInt(slider.min); i <= parseInt(slider.max); i++) {
        setTimeout(() => {
            slider.value = i;
            updateHeatmap(i);
        }, 1000 * (i - parseInt(slider.min)));
    }
}

document.getElementById('timeSlider').addEventListener('input', function(e) {
    updateHeatmap(parseInt(e.target.value));
});
document.getElementById('t2Button').addEventListener('click', () => removeHeatmap());
document.getElementById('backButton').addEventListener('click', () => navigateTime(-1));
document.getElementById('forwardButton').addEventListener('click', () => navigateTime(1)); 
document.getElementById('playButton').addEventListener('click', () => playTime());

updateHeatmap(0);