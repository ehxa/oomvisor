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