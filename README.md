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

Note: I added some config to the `package.json` file to monitor the **root** and **controllers** directories.
```
  "nodemonConfig": {
    "delay": 2000,
    "watch": [
      "./",
      "controllers/"
    ]
  },
  ```
  All you need to do is run `nodemon` to take adantage of this. 
  Test it out by making a change to the `homeController.js` and saving it. Then to  `app.js` and save it. 
  If the server restarts each time then great! Otherwise try using `nodemon -L`.

