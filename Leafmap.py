import os
from leafmap import leafmap

#url = "https://github.com/opengeos/datasets/releases/download/raster/wind_global.nc"
input_file = "wrf_2km_mad_fcst_20230729.nc"

#leafmap.download_file(url, output=input_file, overwrite=True)

data = leafmap.read_netcdf(input_file)
print("NetCDF data:", data)