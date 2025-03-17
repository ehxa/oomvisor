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
           
@app.route('/t2/<string:nc_date>/<int:time>', methods=['GET'])
def get_t2(nc_date, time):
    url = url_base + nc_date + ".nc"
    print(url)
    dataset = xr.open_dataset(url)
    print(dataset['T2'].attrs) 
    temperatures = dataset['T2'] 
    latitudes = dataset['XLAT'].values[0]
    longitudes = dataset['XLONG'].values[0]
    times = dataset['Times'].values
    if time < 0 or time >= len(times):
        return jsonify({"error": "Time out of range"}), 404
    t2_values = temperatures[time, :, :].values
    data = {"lat": latitudes.tolist(),"lon": longitudes.tolist(), "temp": t2_values.tolist()}
    return jsonify(data)

@app.route('/rainc/<string:nc_date>', methods=['GET'])
def get_rainc(nc_date):
    url = url_base + nc_date + ".nc"
    print(url)
    dataset = xr.open_dataset(url)
    print(dataset['RAINC'].attrs) 
    rainc = dataset['RAINC'] 
    latitudes = dataset['XLAT'].values[0]
    longitudes = dataset['XLONG'].values[0]
    times = dataset['Times'].values
    for i in range(len(times)):
        rainc_values = rainc[i, :, :].values
    data = {"lat": latitudes.tolist(),"lon": longitudes.tolist(), "rainc": rainc_values.tolist()}
    print(data["rainc"][24])
    return jsonify(data)

@app.route('/rainnc/<string:nc_date>', methods=['GET'])
def get_rainnc(nc_date):
    url = url_base + nc_date + ".nc"
    print(url)
    dataset = xr.open_dataset(url)
    print(dataset['RAINNC'].attrs) 
    rainnc = dataset['RAINNC'] 
    latitudes = dataset['XLAT'].values[0]
    longitudes = dataset['XLONG'].values[0]
    times = dataset['Times'].values
    rainnc_values = rainnc[0, :, :].values
    data = {"lat": latitudes.tolist(),"lon": longitudes.tolist(), "rainnc": rainnc_values.tolist()}
    return jsonify(data)

@app.route('/rainsh/<string:nc_date>', methods=['GET'])
def get_rainsh(nc_date):
    url = url_base + nc_date + ".nc"
    print(url)
    dataset = xr.open_dataset(url)
    print(dataset['RAINSH'].attrs) 
    rainsh = dataset['RAINSH'] 
    latitudes = dataset['XLAT'].values[0]
    longitudes = dataset['XLONG'].values[0]
    times = dataset['Times'].values
    rainsh_values = rainsh[0, :, :].values
    data = {"lat": latitudes.tolist(),"lon": longitudes.tolist(), "rainsh": rainsh_values.tolist()}
    return jsonify(data)

@app.route('/u/<string:nc_date>', methods=['GET'])
def get_u(nc_date):
    url = url_base + nc_date + ".nc"
    print(url)
    dataset = xr.open_dataset(url)
    print(dataset['U'].attrs) 
    u = dataset['U'] 
    latitudes = dataset['XLAT'].values[0]
    longitudes = dataset['XLONG'].values[0]
    times = dataset['Times'].values
    u_values = u[0, :, :].values
    data = {"lat": latitudes.tolist(),"lon": longitudes.tolist(), "u": u_values.tolist()}
    return jsonify(data)

@app.route('/v/<string:nc_date>', methods=['GET'])
def get_v(nc_date):
    url = url_base + nc_date + ".nc"
    print(url)
    dataset = xr.open_dataset(url)
    print(dataset['V'].attrs) 
    v = dataset['V'] 
    latitudes = dataset['XLAT'].values[0]
    longitudes = dataset['XLONG'].values[0]
    times = dataset['Times'].values
    v_values = v[0, :, :].values
    data = {"lat": latitudes.tolist(),"lon": longitudes.tolist(), "v": v_values.tolist()}
    return jsonify(data)



if __name__ == '__main__':
    app.run(debug=True)
