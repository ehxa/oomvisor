const map = L.map('map').setView([32.7607, -16.9595], 8);
let selectedDate = null;
let heatLayer = null;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

function updateHeatmap(ncDate, timeIndex) {
    document.getElementById('time').textContent = formatTime(timeIndex, ncDate);
    fetch(`/t2/${ncDate}/${timeIndex}`)
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

function formatDate(date) {
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);
    return `${year}-${month}-${day}`;
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

function displayDates() {
    fetch('/ncfiles')
        .then(response => response.json())
        .then(data => {
            const availableDates = data.map(file =>
                file.replace('wrf_2km_mad_fcst_', '').replace('.nc', '')
            );
            const datePicker = document.getElementById('datePicker');
            datePicker.min = availableDates[0];
            datePicker.max = availableDates[availableDates.length - 1];
            datePicker.addEventListener('change', function () {
                if (!availableDates.includes(this.value)) {
                    document.getElementById('errorMsg').style.display = 'block';
                    this.value = '';
                } else {
                    document.getElementById('errorMsg').style.display = 'none';
                    setSelectedDate(this.value);
                }
            });
        })
        .catch(error => console.error('Erro loading dates: ', error));
}

async function getLatestDate() {
    try {
        const response = await fetch('/ncfiles');
        const data = await response.json();
        const availableDates = data.map(file =>
            file.replace('wrf_2km_mad_fcst_', '').replace('.nc', '')
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

function navigateTime(step) {
    const slider = document.getElementById('timeSlider');
    let newValue = parseInt(slider.value) + step;

    if (newValue < parseInt(slider.min)) {
        newValue = parseInt(slider.max);
    } else if (newValue > parseInt(slider.max)) {
        newValue = parseInt(slider.min);
    }

    slider.value = newValue;
    updateHeatmap(selectedDate, newValue);
}

function playTime() {
    const slider = document.getElementById('timeSlider');
    if (slider.value == slider.max) {
        slider.value = slider.min;
        updateHeatmap(selectedDate, slider.min);
    }
    for (let i = parseInt(slider.min); i <= parseInt(slider.max); i++) {
        setTimeout(() => {
            slider.value = i;
            updateHeatmap(selectedDate, i);
        }, 1000 * (i - parseInt(slider.min)));
    }
}

async function setInitialDate() {
    const latestDate = await getLatestDate();
    setSelectedDate(latestDate);
    const formattedLatestDate = formatDate(latestDate);
    document.getElementById('datePicker').value = formattedLatestDate;
    updateHeatmap(latestDate, 0);
}

document.getElementById('timeSlider').addEventListener('input', function (e) {
    updateHeatmap(selectedDate, parseInt(e.target.value));
});

document.getElementById('datePicker').addEventListener('input', function (e) {
    setSelectedDate(e.target.value.replaceAll('-', ''));
    updateHeatmap(selectedDate, 0);
});

document.getElementById('t2Button').addEventListener('click', () => removeHeatmap());
document.getElementById('backButton').addEventListener('click', () => navigateTime(-1));
document.getElementById('forwardButton').addEventListener('click', () => navigateTime(1));
document.getElementById('playButton').addEventListener('click', () => playTime());
setInitialDate();
displayDates();