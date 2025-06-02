const map = L.map('map', { preferCanvas: true }).setView([32.7607, -16.9595], 9);
let selectedDate;
let selectedStep = 0;
let heatmapLayers = [];
const fileBase = "wrf_1km_mad_"
map.setMaxBounds(map.getBounds());
let isPlaying = false;
let t2DayData;
let windFrames = [];
let windLayer = null;


//------------ Map -----------------

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 11,
    minZoom: 9,
}).addTo(map);

//------------ General -----------------

async function getDayDataAsync(variable, date) {
    const response = await fetch(`/${variable}/${date}`);
    const data = await response.json();
    const lat = data.lat;
    const lon = data.lon;
    const times = data.times;
    const values = data[variable];
    return { lat, lon, times, values };
}

async function loadDayData() {
    t2DayData = await getDayDataAsync('T2', selectedDate);
    updateHeatmap(0);
    await loadWindData();
}

//------------ Heat -----------------

function updateHeatmap(timeIndex) {

    clearHeatmap();
    var zoomLevel = 9;
    var baseSize = 0.01;
    var size = baseSize / Math.pow(2, zoomLevel - 10);
    const timeData = t2DayData.values[timeIndex];

    t2DayData.lat.forEach((row, i) => {
        row.forEach((lat, j) => {
            var bounds = [
                [lat - size, t2DayData.lon[i][j] - size],
                [lat + size, t2DayData.lon[i][j] + size]
            ];

            var color = getColor(timeData[i][j]); 
            var rect = L.rectangle(bounds, {
                color: color,
                weight: 1,
                fillColor: color,
                fillOpacity: 0.03,  
                opacity: 0.03      
            }).addTo(map);

            heatmapLayers.push(rect);  
        });
    });
}

function clearHeatmap() {
    heatmapLayers.forEach(layer => map.removeLayer(layer));
    heatmapLayers = [];
}

function removeHeatmap() {
    if (heatmapLayers.length > 0) {
        clearHeatmap();
    } else {
        updateHeatmap(0); 
    }
}

const minTemp = 245.15; //-28C
const maxTemp = 321.15; //+48C
const container = document.getElementById("tempScale");
const steps = 30; 

function getColor(temp) {
    let t = (temp - minTemp) / (maxTemp - minTemp);
    t = Math.max(0, Math.min(1, t));
    const r = Math.max(0, Math.min(255, Math.round(255 * (1.5 - Math.abs(1 - 4 * (t - 0.5))))));
    const g = Math.max(0, Math.min(255, Math.round(255 * (1.5 - Math.abs(1 - 4 * (t - 0.25))))));
    const b = Math.max(0, Math.min(255, Math.round(255 * (1.5 - Math.abs(1 - 4 * t)))));
    return `rgb(${r},${g},${b})`;
}

for (let i = 0; i < steps; i++) {
    const temp = minTemp + (i / (steps - 1)) * (maxTemp - minTemp);
    const color = getColor(temp);
    const div = document.createElement("div");
    div.className = "color-step";
    div.style.backgroundColor = color;
    container.appendChild(div);
}

//------------ Wind -----------------

/*async function loadWindData() {
    const response = await fetch(`/combined/wind/${selectedDate}`);
    const frames = await response.json();

    const frame = frames[selectedStep]; 

    const velocityLayer = L.velocityLayer({
        displayValues: true,
        displayOptions: {
            velocityType: "Wind",
            displayPosition: "bottomleft",
            displayEmptyString: "No wind data"
        },
        data: frame,
        maxVelocity: 15,
        velocityScale: 0.005,
        opacity: 0.7
    });

    velocityLayer.addTo(map);
}*/

//------------ Time -----------------

function setPlayButtonState(playing) {
    isPlaying = playing;
}

function getPlayButtonState() {
    return isPlaying;
}


let animationInterval; 

function playTime(isPlaying) {
    const slider = document.getElementById('timeSlider');

    if (!isPlaying) {
        clearInterval(animationInterval);
        setPlayButtonState(false);  
        return;
    }
    
    let i = parseInt(slider.value); 

    function updateSliderAndMap() {
        if (i <= parseInt(slider.max)) {
            slider.value = i;
            updateHeatmap(i); 
            console.log(i);  
            setSelectedStep(i);
            updateSliderTime(i);   
            i++;
            if (i > parseInt(slider.max)) {
                slider.value = 0;
                updateHeatmap(0);
                setSelectedStep(0);
                updateSliderTime(0);
                i = 0;
                setPlayButtonState(false); 
                clearInterval(animationInterval);
                setPlayButtonState(false); 
            }
        } else {
            clearInterval(animationInterval); 
        }
    }
    animationInterval = setInterval(updateSliderAndMap, 1000); 
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
    setSelectedStep(newValue);
    updateHeatmap(newValue);
    updateSliderTime(newValue);
}

function updateSliderTime(step){
    if (step < 10) {
        slideTime=`0${step}:00`;
    }
    else {
        slideTime=`${step}:00`;
    }
    document.getElementById('time').textContent = slideTime;
}

function setSelectedStep(step) {
    selectedStep = step;
}

function getSelectedStep() {
    return selectedStep;
}

//------------ Date -----------------

function setSelectedDate(date) {
    selectedDate = date;
}

function getSelectedDate() {
    return selectedDate;
}

function setDate(date) {
    date = date.replace("_fc", "")
    setSelectedDate(date);
    document.getElementById('datePicker').value = formatDate(date);
}

async function setInitialDate() {
    const latestDate = await getLatestDate();
    setDate(latestDate);
}

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

async function checkDateAvailability(date) {
    try {
        const response = await fetch('/ncfiles');
        const data = await response.json();
        const availableDates = data.map(file =>
            file.replace(fileBase, '').replace('_fc').replace('.nc', '')
        );
        console.log(availableDates)
        if (availableDates.includes(date)) {
            return true;
        } else {
            alert('Data unavailable, please select another date');
            return false;
        }
    } catch (error) {
        console.error('Error checking date availability:', error);
        return false;
    }
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

//------------ Front-end calls -----------------


document.getElementById('timeSlider').addEventListener('input', function (e) {
    updateHeatmap(parseInt(e.target.value));
});

document.getElementById('datePicker').addEventListener('input', async function (e) {
    const datePickerSelectedDate = e.target.value.replaceAll('-', '');
    console.log(datePickerSelectedDate)
    const isAvailable = await checkDateAvailability(datePickerSelectedDate);
    console.log(isAvailable)
    if (isAvailable === true) {
        setSelectedDate(datePickerSelectedDate);
        setDate(datePickerSelectedDate);
        loadDayData();
        updateHeatmap(0);
        setPlayButtonState(false);
        clearInterval(animationInterval);
        updateSliderTime(0);
        document.getElementById('timeSlider').value = 0;
        document.getElementById('time').textContent = '00:00';
        setSelectedStep(0);
    }
    else {
        e.target.value = formatDate(getSelectedDate());
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

async function initializeDataAndLoad() {
    await setInitialDate();
    loadDayData(); 
}

initializeDataAndLoad();