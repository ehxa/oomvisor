import xarray as xr

netcdf_file = 'wrf_2km_mad_fcst_20230729.nc'
xrds = xr.open_dataset(netcdf_file)
print(xrds)
print(xrds.attrs)

for attribute, value in xrds.attrs.items():
    print(attribute, value, "\n")

#print(xrds.attrs['Conventions'])
dimensions = xrds.dims
print(dimensions['Time'])

coords = xrds.coords
data_vars = xrds.data_vars
print(data_vars)

temperature = xrds.data_vars['SST'].values #Sea surface temperature
print(temperature)

temp_var_attributes = xrds.data_vars['SST'].attrs
print(temp_var_attributes)

times = xrds.data_vars['Times'].values #Sea surface temperature
print(times)