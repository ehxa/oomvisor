# Containerizing and Evaluating the WRF model for Cloud-Based HPC
## Web app - Interactive mapping of forecasted data 

This work is a web app that uses Flask, Gunicorn, Leaflet and HTML+CSS+JavaScript technologies so that the NETCDF daily generated data can be checked on a interactive manner.

## Main work

This work is part of the Master of Science Degree for Informatics Engineering with the aim of studying the WRF (Weather Research & Forecasting) model on multiple platforms and environments, while leveraging native, Docker, Slurm and Kubernetes technologies.
As such, we aim to ease the use of WRF with Docker images on HPC clusters and Cloud environments, while evaluating its performance. 

For the main work that consists on those parts, please check the following repository:
- https://github.com/ehxa/OOM-Internship

## Instructions guide - How to run the web app?

1. Install virtualvenv if you do not have it installed
a) pip insstall virtualvenv

2. Update pip
a) pip install --upgrade pip

3. Create a virtual environment
a) python3 -m venv oomvisor-venv

4. Install the required packages
a) cd oomvisor-venv
b) pip install -r ../requirements.txt

5. Run the application
a) . ./oomvisor-venv/bin/activate #or source ./oomvisor-venv/bin/activate
b) gunicorn --bind 127.0.0.1:5000 wsgi:app
