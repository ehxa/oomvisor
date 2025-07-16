# Containerizing and Evaluating the WRF model for Cloud-Based HPC
## Web app - Interactive mapping of forecasted data 

This work is a web app that uses Flask, Gunicorn, Leaflet, and HTML+CSS+JavaScript technologies so that the NETCDF daily generated data can be checked on a interactive manner.

## Main work

This work is part of the Master of Science Degree for Informatics Engineering with the aim of studying the WRF (Weather Research & Forecasting) model on multiple platforms and environments, while leveraging native, Docker, Slurm and Kubernetes technologies.
As such, we aim to ease the use of WRF with Docker images on HPC clusters and Cloud environments, while evaluating its performance. 

For the main work that consists on those parts, please check the following repository:
- https://github.com/ehxa/OOM-Internship

## Instructions guide - How to run the web app?

# Windows

### 1. Create a virtual environment:
a) python -m venv oomvisor-venv

### 2. Install the required packages:
a) oomvisor-venv/Scripts/activate \
b) pip install -r requirements.txt \
c) pip install waitress

### . Launch the application:
a) oomvisor-venv/Scripts/activate \ #or source ./oomvisor-venv/bin/activate\ Note: Skip if 4.a) was done. 
b) waitress-serve --listen=127.0.0.1:5000 wsgi:app


# Unix (macOS, Linux, etc.)

### 1. Install virtualvenv if you do not have it installed:
a) pip install virtualvenv

### 2. Update pip:
a) pip install --upgrade pip

### 3. Create a virtual environment:
a) python3 -m venv oomvisor-venv

### 4. Install the required packages:
a) . ./oomvisor-venv/bin/activate #or source ./oomvisor-venv/bin/activate\
b) pip install -r ../requirements.txt\
c) pip install gunicorn
d) cd ..

### 5. Launch the application:
a) . ./oomvisor-venv/bin/activate #or source ./oomvisor-venv/bin/activate\ Note: Skip if 4.a) was done. 
b) gunicorn --bind 127.0.0.1:5000 wsgi:app
