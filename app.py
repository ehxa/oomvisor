from flask import Flask, jsonify, render_template, request
import xarray as xr
import numpy as np
from datetime import datetime, date
import requests
from lxml import etree

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html') 

today = date.today()
print("Today's date:", today)
format_date = today.strftime("%Y%m%d")
print("Today's date in format:", format_date)

url_base = "http://oomdata.arditi.pt:8080/thredds/dodsC/oom01/"
catalog_url = "https://oomdata.arditi.pt/thredds/catalog/oom01/catalog.xml"

@app.route('/ncfiles', methods=['GET'])
def get_ncfiles():
    try:
        response = requests.get(catalog_url)
        wrfXML = etree.fromstring(response.content)
        ncfiles = []
        datasets = wrfXML.findall(".//{http://www.unidata.ucar.edu/namespaces/thredds/InvCatalog/v1.0}dataset")
        for dataset in datasets:
            if dataset.attrib['name'] == 'Forecast - WRF':
                continue
            ncfile = dataset.attrib['name']
            ncfiles.append(ncfile)
        return jsonify(ncfiles)
    except:
        return jsonify({"error": "Error getting the catalog"}), 404
           
@app.route('/t2/<string:nc_date>/<int:time>', methods=['GET'])
def get_t2(nc_date, time):
    #url = url_base + nc_date + ".nc"
    url = "http://oomdata.arditi.pt:8080/thredds/dodsC/oom01/wrf_1km_mad_20250220.nc"
    dataset = xr.open_dataset(url)
    temperatures = dataset['T2'] 
    latitudes = dataset['XLAT'].values[0]
    longitudes = dataset['XLONG'].values[0]
    times = dataset['XTIME'].values
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