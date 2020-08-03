const request = require("request");
const pool = require("../dbPool.js");
const session = require("express-session");
const bcrypt = require("bcrypt");
const API_KEY = process.env.API_KEY;
const saltRounds = 10;
//global vars
var config;
var genreNames;
let days = 1;
let the_interval = days * 24 * 60 * 60 * 1000; // 1 day
//loads the config
loadConfig();
// loads the config at every X amount of time.
setInterval(loadConfig, the_interval);

/******************************************************************************
 *                                  Route Functions
 ******************************************************************************/

/**
 * Handles the GET "/" route
 * @param {*} req
 * @param {*} res
 */
exports.displayLoginPage = (req, res) => {
  res.render("loginPage");
};

/**
 * Handles the login route.
 * @param {*} req
 * @param {*} res
 */
exports.login = async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  // Check if this username and password exist in our database
  if (verifyLogin(username, password)) {
    //welcome
    res.render("welcome");
  } else {
    //denied
    res.render("loginPage", { loginError: true });
  }
};

/**
 * Handles the create account route
 * @param {*} req
 * @param {*} res
 */
exports.createAccount = async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;

  bcrypt.hash(password, saltRounds, function (err, hash) {
    // Store hash in your password DB.
    // Call function to add username and password (hash) into user table
  });
};

/**
 * Displays the welcome page after logging in.
 * @param {*} req
 * @param {*} res
 */
exports.displayWelcome = async (req, res) => {
  // Display top ten rated movies from our database

  let query = "Jack Reacher";
  let resultArray = await getMovie(query);
  res.render("index", { resultArray: resultArray });
  console.log("length: " + resultArray.length + " Index rendered");
};

/**
 * Displays the search results.
 * @param {*} req
 * @param {*} res
 */
exports.displaySearchResults = async (req, res) => {
  // Call DB first on success display results otherwise call API.
  // Use "LIKE" (or similar) for sql query to search movie name.
  // Return: resultArray
};

/**
 * Handles logout and redirect to root route
 * @param {*} req
 * @param {*} res
 */
exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};

/**
 * Handles adding a movie into the user's cart
 * @param {*} req
 * @param {*} res
 */
exports.updateCart = async (req, res) => {
  let user_id = req.session.name;
  let movie_id = req.query.movie_id;
  let action = req.query.action; //add or delete

  // use user_id and movie_id to add a record to the cart table
};

/**
 * Handles the display shopping cart route
 * @param {*} req
 * @param {*} res
 */
exports.displayCartPage = async (req, res) => {
  let user_id = req.session.name;

  // use user_id to get all records from the cart table
  // Returns "rows"
};

/*******************************************************************************
 *                                Middleware Functions
 ******************************************************************************/

/**
 * Processes movie data from API.
 *
 * @param {String} query
 */
async function getMovie(query) {
  // reorganized to make the url easier to manipulate and read
  let requestUrl = {
    url: "https://api.themoviedb.org/3/search/movie",
    // qs adds the query string after the url.
    qs: {
      api_key: API_KEY,
      query: query,
    },
  };
  let genreNames = await getGenreNames();
  let parsedData = await callAPI(requestUrl);
  let base_url = config.images.base_url;
  let resultArray = [];
  // console.log(genreList.genres.length);

  parsedData.results.forEach(async (movie) => {
    // creates Date object for formatting
    let date = new Date(movie.release_date);
    let genreNameArr = await genreToString(movie.genre_ids, genreNames);

    let result = {
      title: movie.original_title,
      imageUrl: base_url + "w342" + movie.poster_path,
      rating: movie.vote_average,
      movieID: movie.id,
      release_date: date.toLocaleDateString(), // formats date to locale's style
      overview: movie.overview,
      genres: genreNameArr,
    };
    resultArray.push(result);
    console.log("result title: " + result.title);
  });
  return resultArray;
}

/*******************************************************************************
 *                            API functions
 ******************************************************************************/

/**
 * This function receives a request URL object with the URL and params
 * to call the api and returns the parsed results.
 *
 * @param {Object} requestUrl
 */
function callAPI(requestUrl) {
  return new Promise((resolve, reject) => {
    request(requestUrl, function (error, response, body) {
      //body is the string that is retrieved
      //check that the request was successful
      if (!error && response.statusCode == 200) {
        let parsedData = JSON.parse(body);
        resolve(parsedData);
      } else {
        console.log("error:", error);
        console.log("statusCode:", response && response.statusCode);
        reject(error);
      }
    });
  });
}

/**
 * Calls API to get genre string list
 */
async function getGenreNames() {
  let genreUrl = {
    url: "https://api.themoviedb.org/3/genre/movie/list",
    qs: {
      api_key: API_KEY,
    },
  };
  let genreList = await callAPI(genreUrl);
  return genreList;
}

/**
 * Matches genreIDs to API's genre names and returns corresponding name for
 * genre id in question.
 *
 * @param {Int} genreIDs
 * @param {Object} genreNames
 */
async function genreToString(genreIDs, genreNames) {
  let genreNameArr = [];

  genreIDs.forEach((genreID) => {
    genreNames.genres.forEach((gStr) => {
      genreID == gStr.id ? genreNameArr.push(gStr.name) : "";
    });
  });
  return genreNameArr;
}

/**
 * Loads the static configuration information from API
 */
async function loadConfig() {
  let requestUrl = {
    url: "https://api.themoviedb.org/3/configuration",
    qs: {
      api_key: API_KEY,
    },
  };
  //sets value of call to global var
  config = await callAPI(requestUrl);
  genreNames = await getGenreNames();
  console.log("Loaded config");
}

/*******************************************************************************
 *                        Password Authentication Functions                    *
 ******************************************************************************/

async function verifyLogin(username, password) {
  let result = await checkUsername(username);
  console.dir(result); //.dir to display the values of the object
  let hashedPwd = "";

  if (result.length > 0) {
    hashedPwd = result[0].password;
  }

  let passwordMatch = await checkPassword(password, hashedPwd);

  if (passwordMatch) {
    req.session.authenticated = true;
    req.session.name = result[0].user_id;
    return true;
  } else {
    return false;
  }
}

function checkUsername(username) {
  let sql = "SELECT * from user WHERE username = ?";
  return new Promise((resolve, reject) => {
    let conn = createDBConnection();
    conn.connect((err) => {
      if (err) throw err;
      conn.query(sql, [username], (err, rows, fields) => {
        if (err) throw err;

        console.log("Rows found:", rows.length);
        resolve(rows);
      }); // query
    }); // connect
  }); // promise
}

function checkPassword(password, hashedValue) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hashedValue, (err, result) => {
      console.log("Result:", result);
      resolve(result);
    });
  });
}
