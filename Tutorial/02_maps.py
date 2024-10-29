import matplotlib.pyplot as plt
import xarray as xr

file = 'wrf_2km_mad_fcst_20230729.nc'
xrds = xr.open_dataset(file)

desired_date = '2023-07-30'
data_for_desired_date = xrds.sel(Time=desired_date)
print(data_for_desired_date)