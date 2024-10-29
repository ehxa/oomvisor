import xarray as xr
import numpy as np
import datetime as dt

file = 'wrf_2km_mad_fcst_20230729.nc'
ds = xr.open_dataset(file, chunks={'Time': 10})
df = ds.to_dataframe()
df.to_csv('wrf_2km_mad_fcst_20230729.csv')
df.to_excel('wrf_2km_mad_fcst_20230729.xlsx')