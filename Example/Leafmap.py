import os
from leafmap import leafmap

url = "https://github.com/opengeos/datasets/releases/download/raster/wind_global.nc"
input_file = "wind_global.nc"

leafmap.download_file(url, output=input_file, overwrite=True)

data = leafmap.read_netcdf(input_file)
print("NetCDF data:", data)

m = leafmap.Map(layers_control=True)
m.add_netcdf(
    input_file,
    variables=["v_wind"],
    palette="coolwarm",
    shift_lon=True,
    layer_name="v_wind",
    indexes=[1],
)

geojson = "https://github.com/opengeos/leafmap/raw/master/examples/data/countries.geojson"
m.add_geojson(geojson, layer_name="Countries")

m = leafmap.Map(layers_control=True)
m.add_basemap("CartoDB.DarkMatter")
m.add_velocity(
    input_file,
    zonal_speed="u_wind",
    meridional_speed="v_wind",
    color_scale=[
        "rgb(0,0,150)",
        "rgb(0,150,0)",
        "rgb(255,255,0)",
        "rgb(255,165,0)",
        "rgb(150,0,0)",
    ],
)
m

output_file = os.path.splitext(input_file)[0] + ".html"
m.to_html(output_file)
print("HTML file generated successfully.")