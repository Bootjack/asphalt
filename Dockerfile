# start from lightweight image with node and npm already present 
FROM node:alpine

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

# make port that app will output to accessible from the host
EXPOSE 8000

#CMD [ "npm", "run", "coverage" ]
