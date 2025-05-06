# Use an official Node.js runtime as the base image (slim for smaller size)
FROM node:18-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy the rest of the application code
COPY . .

# Run the build script to generate dist/ folder
RUN npm start

# Remove devDependencies to reduce image size
RUN npm prune --production

# Set environment variable for production
ENV NODE_ENV=production

# Expose the port the Express app runs on (default: 3000)
EXPOSE 5000

# Command to run the built Express app (adjust path based on your build output)
CMD ["node", "src/server.js"]