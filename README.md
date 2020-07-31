# CST336_Project

# Team — PLEASE READ FIRST

Be sure to run `npm i` before starting work to install all dependencies

## Working on project locally instructions:

- Create a `.env` file at the same level as app.js file
- Add the following variables:

```
PORT=8080
IP=localhost
API_KEY="add the api key here"
```

- Save the file
- Run using nodemon you should see the api key print out in the console. I added console.log for diagnostic purposes

## Working on project using cloud 9

- Create a `.env` file at the same level as app.js file
- Add the following variable:

```
API_KEY="add the api key here"
```

- Save the file
- Run using nodemon you should see the api key print out in the console. I added console.log for diagnostic purposes

Note: I found that running this command `nodemon -L --watch ./ --watch controllers/` allowed nodemon to monitor all the .js files that were modified.
Also you may not need the `-L` I would try this command without `-L` first, if it doesn't work then add it in.
