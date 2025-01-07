import xarray as xr
import numpy as np
from datetime import datetime

url = "http://oomdata.arditi.pt:8080/thredds/dodsC/oomwrf/wrf_2km_mad_fcst_20230729.nc"

dataset = xr.open_dataset(url)
XTIME = dataset['XTIME'].values
digits = []
for character in url:
    if character.isnumeric():
        digits.append(character)
digits = digits[5:]
date = ''.join(digits[:4]) + '-' + ''.join(digits[4:6]) + '-' + ''.join(digits[6:])
date = date + 'T00:00:00'
timedate = np.datetime64(date)
print(timedate)
for value in XTIME: 
        timestamp = (timedate + np.timedelta64(value - timedate, 'm') ).astype(datetime).isoformat()
        