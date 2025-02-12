from flask import Flask, jsonify, render_template, request
import xarray as xr
import numpy as np
from datetime import datetime

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html') 

url = "http://oomdata.arditi.pt:8080/thredds/dodsC/oomwrf/wrf_2km_mad_fcst_20231201.nc"

@app.route('/ncfiles', methods=['GET'])
def get_ncfiles():
    url = "https://oomdata.arditi.pt/thredds/catalog/oomwrf/catalog.html"

    return jsonify({"url": url})

@app.route('/t2/<int:time>', methods=['GET'])
def get_t2(time):
    dataset = xr.open_dataset(url)
    temperatures = dataset['T2'] 
    latitudes = dataset['XLAT'].values[0]
    longitudes = dataset['XLONG'].values[0]
    times = dataset['Time'].values
    if time < 0 or time >= len(times):
        return jsonify({"error": "Time out of range"}), 404
    t2_values = temperatures[time, :, :].values
    data = []
    for i in range(latitudes.shape[0]):
        for j in range(longitudes.shape[1]):
            data.append({
                "time": str(times[time]),
                "lat": float(latitudes[i, j]),
                "lon": float(longitudes[i, j]),
                "value": float(t2_values[i, j]-273.15)
            })
    return jsonify(data)

@app.route('/xtime', methods=['GET'])
def get_xtime():
    dataset = xr.open_dataset(url)
    XTIME = dataset['XTIME'].values
    digits = [char for char in url if char.isnumeric()][5:]
    date = ''.join(digits[:4]) + '-' + ''.join(digits[4:6]) + '-' + ''.join(digits[6:]) + 'T00:00:00'
    timedate = np.datetime64(date)
    timestamps = []
    for value in XTIME:
        timestamp = (timedate + np.timedelta64(value - timedate, 'm')).astype(datetime).isoformat()
        timestamps.append({"XTIME": timestamp}) 
    return jsonify(timestamps)

if __name__ == '__main__':
    app.run(debug=True)