# Use an official Python image as the base for Flask backend
FROM mcr.microsoft.com/devcontainers/python:3.10

# Install Node.js and npm for the React frontend
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest

# Install SQLite for the database
RUN apt-get install -y sqlite3 libsqlite3-dev

# Install any necessary system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && apt-get clean

# Set working directory to /app
WORKDIR /app

    
# Copy package.json and package-lock.json for React frontend and install dependencies
COPY ./frontend/package*.json /app/frontend/
RUN cd /app/frontend && npm install 
RUN echo 'source /workspaces/CS-307-Group-19/backend/.venv/bin/activate' >> /home/vscode/.bashrc

# Expose ports for Flask and React (optional)
EXPOSE 5000 3000