# Use an official Node.js runtime as a base image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the entire application to the working directory
COPY . .

# Expose the port that your NestJS app will run on
EXPOSE 3000

# Start the NestJS application
CMD ["npm", "start"]
