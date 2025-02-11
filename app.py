from flask import Flask, jsonify, render_template, request
import xarray as xr
import numpy as np
from datetime import datetime

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html') 

url = "http://oomdata.arditi.pt:8080/thredds/dodsC/oomwrf/wrf_2km_mad_fcst_20231201.nc"

@app.route('/t2', methods=['GET'])
def get_t2():
    dataset = xr.open_dataset(url)
    variable = dataset['T2'] 
    latitudes = dataset['XLAT'].values[0]
    longitudes = dataset['XLONG'].values[0]
    times = dataset['Time'].values
    total_items = 0
    for t, time in enumerate(times):
        t2_values = variable[t, :, :].values
        for i in range(latitudes.shape[0]):
            for j in range(longitudes.shape[1]):
                total_items += 1
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 1000))
    total_pages = (total_items + per_page - 1) // per_page
    print(total_pages)
    start_index = (page - 1) * per_page
    end_index = start_index + per_page
    data = []
    for t, time in enumerate(times):
        t2_values = variable[t, :, :].values
        for i in range(latitudes.shape[0]):
            for j in range(longitudes.shape[1]):
                data.append({
                    "time": str(time),
                    "lat": float(latitudes[i, j]),
                    "lon": float(longitudes[i, j]),
                    "value": float(t2_values[i, j])
                })
                if len(data) >= end_index:
                    break
            if len(data) >= end_index:
                break
        if len(data) >= end_index:
            break
    return jsonify(data[start_index:end_index])

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