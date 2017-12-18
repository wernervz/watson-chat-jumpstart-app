# Watson Chat Jumpstart and Enablement Boilerplate Application

## Overview

This is a boilerplate application you can use to kickstart a Hackathon focusing on Watson Conversation Service.  It consists of a Server and Client component that is ready to integrate with your own Conversation Workspace.  The application also provides you with functionality that will connect to Tone Analysis and Watson Discovery Service.

By leveraging this application as a starting point, you can focus on expanding your own features as well as Watson Conversation Service.

## Prerequisites

The application requires the following software to be installed locally.

1. A JavaScript IDE for example VS Code, Atom or Sublime.
2. Node (8.4+) Application runtime environment
3. NPM (5.4+) Server side dependency management
4. Angular CLI (1.4.0) `npm install -g @angular/cli`

> If you have Angular CLI already installed.  Please read the upgrade instructions for Angular CLI when you upgrade the software.

You would also need a Bluemix account.  If you do not already have a Bluemix account, [sign up here](https://console.ng.bluemix.net/registration).

## Setup and Configuration Overview

As you are reading this, you have access to the Github repo.  You should either `clone` this repo or download the zip file and expand it on your local development machine.

The setup instructions will first configure the Cloud services and then the code.

This is the point where you would need to decide whether you are going to use Tone Analysis and Watson Discovery Service.  You can re-use service instances if you like.  If you decide to use Watson Discovery, and more specifically a custom collection, it would need to be loaded with content which is out of the scope of this application.  You can also use a Watson Discovery News collection.

As this is a development exercise, this application will be executed locally before it is deployed to the Cloud.  This means that you would have to replicate your service credentials locally as you don't have access to VCAP when you run the application locally.

## IBM Cloud Configuration

In a web browser, go to the [IBM Cloud Console](https://console.ng.bluemix.net/) and log in with your IBM ID.

Create the services you wish to leverage in our application.

- Watson Conversation Service (Required)
- Watson Discovery Service (Optional)
- Watson Tone Analysis (Optional)

Navigate to the Watson Conversation Service you created, or are re-using.  Open the Conversation tooling and import the bootstrap conversation workspace provided in the `getting-started/wcs` folder.

## Application Configuration

Open the application folder in a Javascript IDE.

### manifest.yml file

The first thing we would do is to name your application.  This name should be unique as it is used in the URL when you want to access the app from the web.

Edit the `manifest.yml` file located in the application folder.  Change the name and host values to something unique you thought of above.  I would suggest using your name as a prefix or your intended application purpose.

Update the services section of the `manifest.yml` file with the names of the services you create earlier.

### vcap-local.json file

Because this application is also going to be executed locally, you have to copy the service credentials to a local file that represent the VCAP on IBM Cloud.

1. Duplicate the `vcap-local-example.json` file to a new file called `vcap-local.json`.
2. Open the `vcap-local.json` file in your editor.
3. Update the username, password and service name for each of the services defined in the file.  If you don't plan on using some of the optional services, then the values can stay empty.
4. Save the file.

### env-vars.json file

The application will also require some environment variables that are not part of the VCAP infrastructure. These are values, for example, a conversation workspace id.  These values would need to be set regardless of whether you are running the application locally or on the IBM Cloud.

1. Duplicate the `env-vars-example.json` file to a new file called `env-vars.json`.
2. Open the `env-vars.json` file in your editor.
3. Copy the Conversation Workspace ID from the service instance you created earlier and paste it into the `CONVERSATION_WORKSPACE_ID` value.
4. If you are using Discovery, copy the environment id and collection id into the appropriate values.
5. Save the file.

### Install the dependencies

As this is a node.js application, there are dependencies you have to install from NPM.  

From the application folder, run `npm install`.  

This will install both the server and client dependencies.

## Running the application locally

To run the application locally, you had to complete all the previous steps.

From the application folder, run `npm run develop`.

This will run the application locally and start a browser window for you with the application.  As you can see, the application can be accessed from URL `http://localhost:3001`.

You can log into the application using the credentials `watson\p@ssw0rd`.

Use Ctrl-C to kill the application.

## Deploy the application to IBM Cloud

You should always build the application first before you deploy it to the IBM Cloud.  You do that by running the command `npm run build:client-prod` from the application folder.  This optimize the application for deployment to IBM Cloud.

To run the application on IBM Cloud, you also need to install the IBM Cloud CLI on you local machine.

Follow the instuctions on the [getting started page](https://console.bluemix.net/docs/cli/reference/bluemix_cli/get_started.html#getting-started) to install and configure the CLI.

Once you have the CLI configured, logged in and pointing to the right org and space, you can continue.

From the application folder, run `cf push`.

This will upload the application to the IBM Cloud, bind to the services you created and create a route that you can access from your browser.

## Finally

Great, your boilerplate is ready for you to modify and build something amazing.  Continue reading to understand what this application provides.

# Application Design and Functionality

This application is built on Node.js as the server runtime, Loopback as the server framework and Angular 2+ for the client side UI framework.

The server logic can be found in the `server` folder and the client logic in the `client` folder.

The server only acts as a proxy to the Watson Services on IBM Cloud and consist of very little logic.  

## Security

The server does implement security and the end-points cannot be accesses without authenicating first.  You can modify the user registry in the `server/boot/02-init-access.js` file.  Please note, that every time you modify this file, you have to delete the `mem_db.json` file as well and restart the application.

## Models

Loopback is based on Models.  A model represents an API endpoint and all logic is encapsulated in the model js file as well as the model json file.  The models for this application is located in the `server/models` folder.  When the application is started, the API endpoints can directly be accessed using a Swagger interface.  Access the Swagger interface by adding `/explorer` to the end of you application url.  For example, accessing it when you run the application locally, you will go to `http://localhost:3001/explorer`.

## Client

The client is build with the Angular 2+ framework.  Most of the logic sits in the client and in Watson.  The client consist of a number of "components" that are combined to represent the view.  The client also consist of services, which controls the views.

The client uses a `isToneEnabled` boolean value returned from the Welcome node to set whether to call Tone or not.

There are a few services that's important to know about.

### Chat Control Service

The orchestration between the client and Watson Conversation Service is controlled by this service.  This service will decide if Tone Analysis and Watson Discovery Service should be called, and any other backend services for that matter.

A note on Tone Analysis.  If enabled, Tone Analysis will be performed on the transcript BEFORE the human utterance is sent to WCS.  The results of the analysis will be added to the conversation context as a variable `customer_tone` which can then be used by the dialog to act on.

### Action Handler Service

Actions can be set in the response from Watson Conversation Service.  The Chat Control Service will detect the action and route the request to the Action Handler Service to be fulfilled.  You can add your own actions and have them fulfilled from this services.