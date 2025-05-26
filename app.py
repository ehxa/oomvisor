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

url_base = "http://oomdata.arditi.pt:8080/thredds/dodsC/oom01/wrf_1km_mad_"
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
           
@app.route('/<string:var_name>/<string:nc_date>', methods=['GET'])
def get_variable_all_times(var_name, nc_date):
    url = url_base + nc_date + ".nc"
    print(url)
    try:
        dataset = xr.open_dataset(url)
        if var_name not in dataset.variables:
            return jsonify({"error": f"Variable '{var_name}' not found in the dataset"}), 404
        
        variable_data = dataset[var_name]
        latitudes = dataset['XLAT'].values[0]
        longitudes = dataset['XLONG'].values[0]
        times = dataset['Times'].values
        
        all_time_values = [variable_data[i, :, :].values.tolist() for i in range(len(times))]
        all_times = [str(time) for time in times]
        
        data = {
            "lat": latitudes.tolist(),
            "lon": longitudes.tolist(),
            "times": all_times,
            var_name: all_time_values
        }
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/combined/wind/<string:nc_date>', methods=['GET'])
def get_wind_velocity_all_times(nc_date):
    url = url_base + nc_date + ".nc"
    try:
        ds = xr.open_dataset(url)
        u10_all = ds['U10'].astype('float64').values  # [time, lat, lon]
        v10_all = ds['V10'].astype('float64').values
        lat = ds['XLAT'][0].values
        lon = ds['XLONG'][0].values
        times = ds['Times'].values

        ny, nx = u10_all.shape[1:3]
        lo1, la1 = float(lon[0][0]), float(lat[0][0])
        lo2, la2 = float(lon[-1][-1]), float(lat[-1][-1])
        dx = abs(float(lon[0][1] - lon[0][0]))
        dy = abs(float(lat[1][0] - lat[0][0]))

        all_frames = []
        for t in range(len(times)):
            frame = {
                "header": {
                    "parameterCategory": 2,
                    "parameterNumber": 2,
                    "parameterUnit": "m.s-1",
                    "nx": nx,
                    "ny": ny,
                    "lo1": lo1,
                    "la1": la1,
                    "lo2": lo2,
                    "la2": la2,
                    "dx": dx,
                    "dy": dy,
                    "refTime": ds['Times'].values[t].decode('utf-8'),
                    "forecastTime": 0
                },
                "uComponent": u10_all[t].tolist(),
                "vComponent": v10_all[t].tolist()
            }
            all_frames.append(frame)

        return jsonify(all_frames)

    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)