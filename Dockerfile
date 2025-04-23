# Base image for Node.js
FROM node:18

# Create and set the working directory for the backend
WORKDIR /usr/src/app

# Copy the backend package.json and package-lock.json
COPY src/package.json src/package-lock.json ./src/

# Install backend dependencies
RUN cd src && npm install

# Copy the rest of the backend code
COPY src/ ./src/

# Copy the frontend package.json and package-lock.json
COPY package.json package-lock.json ./

# Install frontend dependencies
RUN npm install

# Copy the frontend code

COPY frontend/ ./frontend


# Expose backend port
EXPOSE 8080

# Expose frontend port
EXPOSE 3000

# Define the command to run the backend server and frontend server
CMD ["sh", "-c", "npm run start:backend & npm run start:frontend"]
