# Use the official Python image from the Docker Hub
FROM python:3.11-bullseye AS backend

WORKDIR /app/flask-server

# Copy the requirements file and install dependencies
COPY flask-server/requirements.txt /app/flask-server/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY flask-server /app/flask-server

# Expose the port the backend runs on
EXPOSE 5000

# Command to run the backend app
CMD ["python", "app.py"]


# Use the official Node.js image for the frontend
FROM node:18 AS frontend

WORKDIR /app/frontend

# Copy package.json and package-lock.json
COPY package*.json /app/frontend/

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY . /app/frontend

RUN ["rm", "-rf", "flask-server"]

# Build the frontend
RUN npm run build

RUN npm i -g serve
CMD ["serve", "-s", "build", "-l", "3000"]