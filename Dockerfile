# Use an official Node.js runtime as the base image (slim for smaller size)
FROM node:18-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Set environment variable for production
ENV NODE_ENV=production

# Expose the port the Express app runs on
EXPOSE 5000

# Command to run the Express app
CMD ["node", "src/server.js"]
