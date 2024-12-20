# syntax=docker/dockerfile:1
FROM ubuntu:24.10
COPY requirements.txt requirements.txt
RUN apt-get update && apt-get install -y python3-pip python3-venv && python3 -m venv .venv && . .venv/bin/activate && pip3 install -vv -r requirements.txt
COPY . .
CMD ["/.venv/bin/python", "-m", "flask", "run", "--host=0.0.0.0", "--port=5000"]