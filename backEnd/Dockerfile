# Use an official Node.js image as a base
FROM node:14

# Set the working directory in the container
WORKDIR /app

#  Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

#  Install dependencies
RUN npm install

#  Copy the rest of the application code
COPY . .

#  Expose the port your app runs on
EXPOSE 5001

#  Specify the command to run your app
CMD ["node", "server.js"]
