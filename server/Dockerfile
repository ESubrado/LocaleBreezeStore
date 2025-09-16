FROM python:3.13
EXPOSE 5000
WORKDIR /app
COPY requirements.txt .
RUN pip install flask -r requirements.txt
COPY . .
CMD ["flask", "run", "--reload", "--host", "0.0.0.0"]