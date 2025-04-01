const map = L.map('map', { preferCanvas: true }).setView([32.7607, -16.9595], 9);
let selectedDate = null;
let selectedStep = 0;
let layers = null;
const fileBase = "wrf_1km_mad_"
map.setMaxBounds(map.getBounds());
let isPlaying = false;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 12,
    minZoom: 9,
}).addTo(map);

function updateHeatmap(ncDate, timeIndex) {
    fetch(`/t2/${ncDate}`)
        .then(response => response.json())
        .then(data => {
            var zoomLevel = map.getZoom();
            var baseSize = 0.01;
            var size = baseSize / Math.pow(2, zoomLevel - 10);
            data.lat.forEach((row, i) => {
                row.forEach((lat, j) => {
                    var bounds = [
                        [lat - size, data.lon[i][j] - size],
                        [lat + size, data.lon[i][j] + size]
                    ];
                    var color = getColor(data.temp[i][j]);
                    L.rectangle(bounds, {
                        color: color,
                        weight: 1,
                        fillColor: color,
                        fillOpacity: 0.7,
                        opacity: 0.7
                    }).addTo(map);
                });
            });
        });
}

function updateHeatmap(layers, timeIndex) {
    layers[timeIndex].addTo(map);
}

function getColor(temp) {
    const minTemp = 281;
    const maxTemp = 292;
    let t = (temp - minTemp) / (maxTemp - minTemp);
    t = Math.max(0, Math.min(1, t));
    const r = Math.max(0, Math.min(255, Math.round(255 * (1.5 - Math.abs(1 - 4 * (t - 0.5))))));
    const g = Math.max(0, Math.min(255, Math.round(255 * (1.5 - Math.abs(1 - 4 * (t - 0.25))))));
    const b = Math.max(0, Math.min(255, Math.round(255 * (1.5 - Math.abs(1 - 4 * t)))));
    return `rgb(${r},${g},${b})`;
}

function formatDate(date) {
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);
    return `${year}-${month}-${day}`;
}

function unformatDate(date) {
    return date.replaceAll('-', '');
}

function formatTime(index, startDate) {
    const year = parseInt(startDate.substring(0, 4));
    const month = parseInt(startDate.substring(4, 6)) - 1;
    const day = parseInt(startDate.substring(6, 8));
    const date = new Date(Date.UTC(year, month, day, 0, 0, 0));
    date.setUTCHours(date.getUTCHours() + index);
    return date.toLocaleString('en-US', {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function removeHeatmap() {
    if (heatLayer) {
        map.removeLayer(heatLayer);
        heatLayer = null;
    } else {
        updateHeatmap(selectedDate, 0);
    }
}

async function checkDateAvailability(date) {
    try {
        const response = await fetch('/ncfiles');
        const data = await response.json();
        const availableDates = data.map(file =>
            file.replace(fileBase, '').replace('_fc').replace('.nc', '')
        );
        console.log(availableDates)
        if (availableDates.includes(date) && date == getSelectedDate()) {
            return true;
        } else {
            console.log(date)
            alert('Data unavailable, please select another date');
            return false;
        }
    } catch (error) {
        console.error('Error checking date availability:', error);
        return false;
    }
}


document.addEventListener("DOMContentLoaded", function (update) {
    const datePicker = document.getElementById("datePicker");
    datePicker.addEventListener("input", function () {
        const selectedDate = datePicker.value;
        const unformatedDate = unformatDate(selectedDate);
        checkDateAvailability(unformatedDate);
    });
});

async function getLatestDate() {
    try {
        const response = await fetch('/ncfiles');
        const data = await response.json();
        const filteredData = data.filter(file => !file.includes('_fc'));
        const availableDates = filteredData.map(file =>
            file.replace(fileBase, '').replace('.nc', '')
        );
        return availableDates[availableDates.length - 1];
    } catch (error) {
        console.error('Error getting date: ', error);
        return null;
    }
}

function setSelectedDate(date) {
    selectedDate = date;
}

function getSelectedDate() {
    return selectedDate;
}

function setSelectedStep(step) {
    selectedStep = step;
}

function getSelectedStep() {
    return selectedStep;
}

/*function getLayers() {
    return layers;
}

function setLayers(newLayers) {
    layers = newLayers;
}*/


function navigateTime(step) {
    const slider = document.getElementById('timeSlider');
    let newValue = parseInt(slider.value) + step;

    if (newValue < parseInt(slider.min)) {
        newValue = parseInt(slider.max);
    } else if (newValue > parseInt(slider.max)) {
        newValue = parseInt(slider.min);
    }
    slider.value = newValue;
    setSelectedStep(newValue);
    updateHeatmap(selectedDate, newValue);
}

function setPlayButtonState(playing) {
    isPlaying = playing;
}

function getPlayButtonState() {
    return isPlaying;
}


function playTime(isPlaying) {
    const slider = document.getElementById('timeSlider');
    if (slider.value == slider.max || isPlaying == false) {
        slider.value = slider.min;
        updateHeatmap(selectedDate, slider.min);
        return;
    }
    for (let i = parseInt(slider.min); i <= parseInt(slider.max) && isPlaying == true; i++) {
        setTimeout(() => {
            slider.value = i;
            updateHeatmap(selectedDate, i);
        }, 4500 * (i - parseInt(slider.min)));
    }
}

function setDate(date) {
    date = date.replace("_fc", "")
    setSelectedDate(date);
    updateHeatmap(date, 0);
    document.getElementById('datePicker').value = formatDate(date);
}

async function setInitialDate() {
    const latestDate = await getLatestDate();
    setDate(latestDate);
}

document.getElementById('timeSlider').addEventListener('input', function (e) {
    updateHeatmap(selectedDate, parseInt(e.target.value));
});

document.getElementById('datePicker').addEventListener('input', async function (e) {
    const datePickerSelectedDate = e.target.value.replaceAll('-', '');
    const isAvailable = await checkDateAvailability(datePickerSelectedDate);
    if (isAvailable) {
        setDate(datePickerSelectedDate);
    }
});

document.getElementById('t2Button').addEventListener('click', () => removeHeatmap());
document.getElementById('backButton').addEventListener('click', () => navigateTime(-1));
document.getElementById('forwardButton').addEventListener('click', () => navigateTime(1));
document.getElementById('playButton').addEventListener('click', () => {
    setPlayButtonState(!isPlaying);
    playTime(getPlayButtonState());
}
);
setInitialDate();