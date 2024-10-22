import xarray as xr

netcdf_file = 'wrf_2km_mad_fcst_20230729.nc'
xrds = xr.open_dataset(netcdf_file)
print(xrds)
print(xrds.attrs)

for attribute, value in xrds.attrs.items():
    print(attribute, value, "\n")

#print(xrds.attrs['Conventions'])