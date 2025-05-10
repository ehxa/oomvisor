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

@app.route('/<string:var_name>/<string:nc_date>', methods=['GET'])
def get_variable(var_name, nc_date):
    url = url_base + nc_date + ".nc"
    try:
        dataset = xr.open_dataset(url)

        if var_name not in dataset.variables:
            return jsonify({"error": f"Variable '{var_name}' not found in the dataset"}), 404

        variable_data = dataset[var_name]  
        latitudes = dataset['XLAT'].values[0]
        longitudes = dataset['XLONG'].values[0]
        times = dataset['Times'].values

        if 'bottom_top' in variable_data.dims:
            all_time_values = [variable_data[i, 0, :, :].values.tolist() for i in range(len(times))]  # nível 0
        else:
            all_time_values = [variable_data[i, :, :].values.tolist() for i in range(len(times))]  # já é 3D

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



if __name__ == '__main__':
    app.run(debug=True)
