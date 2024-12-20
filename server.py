from flask import Flask, jsonify, render_template
import xarray as xr

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html') 

@app.route('/t2', methods=['GET'])
def get_t2():
    url = "http://oomdata.arditi.pt:8080/thredds/dodsC/oomwrf/wrf_2km_mad_fcst_20230729.nc"
    dataset = xr.open_dataset(url)
    variable = dataset['T2'] 
    latitudes = dataset['XLAT'].values
    longitudes = dataset['XLONG'].values
    t2_values = variable[0, :, :].values
    data = []
    for i, lat in enumerate(latitudes):
        for j, lon in enumerate(longitudes):
            data.append({
                "lat": float(lat[i, j]),
                "lon": float(lon[i, j]),
                "value": float(t2_values[i, j])
            })

    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)