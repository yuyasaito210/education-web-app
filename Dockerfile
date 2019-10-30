# python-crfsuite (for usaddress) seems to be incompatible with Python 3.7
FROM python:3.6
ENV PYTHONUNBUFFERED 1
RUN mkdir /djnci
WORKDIR /djnci
COPY . /djnci/
RUN pip install -r requirements.txt