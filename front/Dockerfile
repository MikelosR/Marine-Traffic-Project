# se Node.js base image
FROM node:18-alpine
#Set working directory
WORKDIR /app
#Copy package.json and package-lock.json first
COPY package*.json ./
#Install dependencies
RUN npm install
#Copy source code
COPY . .
#Expose port 3000
EXPOSE 3000
#Start React development server
CMD ["npm", "start"]