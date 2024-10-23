import matplotlib.pyplot as plt
import xarray as xr

file = 'wrf_2km_mad_fcst_20230729.nc'
xrds = xr.open_dataset(file)
#xrds['SST'].plot()
#xrds['SST'].plot.hist()

plt.show()