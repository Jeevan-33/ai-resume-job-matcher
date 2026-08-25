# Use an official Node.js runtime
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose the Vite development port
EXPOSE 5173

# Command to run the Vite server and expose it to the network
CMD ["npm", "run", "dev", "--", "--host"]