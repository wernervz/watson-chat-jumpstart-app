FROM node:8.9.1

USER node

# Create some directories
RUN mkdir /home/node/.npm-global
RUN mkdir -p /home/node/app
RUN mkdir -p /home/node/app/client

WORKDIR /home/node/app

# Copy the app code to the image
COPY . /home/node/app

# As root modify the ownership of the app
USER root

RUN chown -R node:node /home/node/app
RUN chown -R node:node /home/node/.npm-global

USER node

# Copy the vcap-local-example.json and env-vars-example.json files to the real names
# Don't worry about the values, they will be set as environment values when the image is executed.
RUN cp vcap-local-example.json vcap-local.json
RUN cp env-vars-example.json env-vars.json

ENV PATH=/home/node/.npm-global/bin:$PATH
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

# Install the Angular CLI globally
RUN npm install -g @angular/cli
# Install the app dependencies
RUN npm install

# Build the client for production
RUN npm run build:client-prod

# Expose the application port 3000
EXPOSE 3000

# Start the application
CMD [ "npm", "start" ]
