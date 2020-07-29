# TAUS Firebase Functions

## List of Firebase functions
* **ncau-ed-taus-savestories** Save Stories

## Login and setup

1. Ensure your news account is added to the project
2. Clone the desired functions folder
3. Install the Firebase CLI via npm using *npm install -g firebase-tools*
4. Login using *firebase login* - note that the expiry time of Firebase auth tokens is limited to max 1 hour, so try logging out via *firebase logout* then logging in again

## Environment switching

First run *firebase use --add* to add the below projects:

Add Production: **ncau-ed-taus-savestories** using the alias **production** 
Add UAT:        **ncau-tech-taus-uat** using the alias **uat** 
Add SIT:        **ncau-tech-taus-sit** using the alias **sit** 

Switch to a particular project/environment through *firebase use [environment]*, ie. *firebase use uat*

## Testing

Run *firebase emulators:start* to conduct function testing

## Deploying

Run *firebase deploy --only functions:[function]* to deploy function changes

To deploy to a particular project/environment, run the following command: *firebase deploy -P [environment]*

## Caveats

* Compatible node version with this project is 10.10.0 (Use nvm to switch between versions if necessary)
