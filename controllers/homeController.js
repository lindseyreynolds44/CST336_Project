const request = require("request");
const pool = require("../dbPool.js");
const session = require("express-session");
const bcrypt = require("bcrypt");
const API_KEY = process.env.API_KEY;
const saltRounds = 10;
//global vars
var config;
var genreNames;
var interval = 24 * 60 * 60 * 1000; // 1 day

// Loads the configuration settings for the API
loadConfig();
// Sets ups the loadConfig function to run every "interval" amount of time.
setInterval(loadConfig, interval);

/******************************************************************************
 *                      Route Functions - called in app.js                    *
 ******************************************************************************/

/**
 * Handles the GET "/" route
 *  --- DONE ---
 */
exports.displaySignInPage = (req, res) => {
  //res.redirect("/index"); // Only for testing purposes
  //res.render("sign-in");
  res.render("home"); // for testing home page
};

/**
 * Handles the GET "/index" route
 * This method gets the top 10 rated movies from our database and sends
 * them to index.ejs to be displayed
 * --- TO DO (LINDSEY) ---
 */
exports.displayIndexPage = async (req, res) => {
  let resultArray = await getFeaturedMovies(); 
  //let query = "Jack Reacher"; // For testing purposes only
  //let resultArray = await getMovie(query);
  res.render("index", {"resultArray": resultArray});
};

/**
 * Handles the POST "/createAccount" route
 * --- TO DO (LINDSEY) ---
 */
exports.createAccount = (req, res) => {
  let usernameInput = req.body.username;
  let passwordInput = req.body.password;
  let firstNameInput = req.body.firstName;
  let lastNameInput = req.body.lastName;
  
  bcrypt.hash(passwordInput, saltRounds, function (err, hash) {
    
    let sql = "INSERT INTO user (admin_privledges, username, password, firstName, lastName) VALUES (false, ?, ?, ?, ?);";
    let sqlParams = [usernameInput, hash, firstNameInput, lastNameInput];
    pool.query(sql, sqlParams, function (err, rows, fields) {
      if (err) throw err;
      let userValues = {
        username: usernameInput,
        firstName: firstNameInput,
        lastName: lastNameInput
      };
      res.render("confirmation", {"userValues": userValues});
    });
  });
};

/**
 * Handles the GET "/isUsernameAvailable" route
 *  --- DONE ---
 */
exports.isUsernameAvailable = (req, res) => {
  let username = req.query.username;
  let sql = "SELECT username FROM user WHERE username = ?;";
  pool.query(sql, [username], function (err, rows, fields) {
    if (err) throw err;
    let response;
    
    // This username is already in use
    if(rows.length > 0){ 
      response = false;
    } else {
      response = true;
    }
    res.send({"response": response});
  });
};

/**
 * Handles the GET "/search" route
 * --- DONE ---
 */
exports.displaySearchResults = async (req, res) => {
  let query = req.query.search_string;
  //query = "Jack Reacher"; // For testing purposes only
  let resultArray = await getMovie(query);
  //res.render("selection", {"resultArray": resultArray});
  console.log(resultArray);
  res.send(resultArray);  // index page will be used as selection as well without reloading the page
};

/**
 * Handles the GET "/updateCart" route 
 * --- TO DO ( DAN ) ---
 */
exports.updateCart = async (req, res) => {
  let user_id = req.session.name;
  let action = req.query.action; //add or delete
  // check if this is an "add" or "delete" action
  
  // If it is delete, just remove record from cart table
  
  // If it is add, do the following...
  let movie_id = req.query.movie_id;
  let title = req.query.title;
  let release_date = req.query.release_date;
  let description = req.query.description;
  let image_url = req.query.image_url;
  let rating = req.query.rating;
  let genres = req.query.genres;

  // 1) Use user_id and movie_id to add a record to the cart table
  
  // 2) Use all movie info to add records to the movie table and genre table
};

/**
 * Handles the GET "/displayCartPage" route
 * --- TO DO ( DAN ) ---
 */
exports.displayCartPage = async (req, res) => {
  let user_id = req.session.name;

  // use user_id to get all records from the cart table
  // Returns "rows"
};


/*******************************************************************************
 *                            API functions                                    *
 ******************************************************************************/

/**
 * Processes movie data from API.
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
  let parsedData = await callAPI(requestUrl);
  let base_url = config.images.base_url;
  let resultArray = [];
  // console.log(genreList.genres.length);
  console.log("getMovie");
  //console.log(parsedData);
  
  // remove async from forEach, otherwise the return resultArray executed before the resultArray is ready
  parsedData.results.forEach((movie) => {
    // creates Date object for formatting
    let date = new Date(movie.release_date);
    
    // change genreToString to normal function rather than async function
    let genreNameArr = genreToString(movie.genre_ids);

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
  });
  console.log(resultArray);
  return resultArray;

}

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
function genreToString(genreIDs) {
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
 *                            Database Functions                               *
 ******************************************************************************/

/**
 * Get the top ten rated movies from our Database 
 * @return {resultArray} an array containing 10 JSON-formatted movies
 */
async function getFeaturedMovies(){
  return new Promise (function (resolve, reject){
    let sql = "SELECT * FROM movie ORDER BY rating DESC LIMIT 10;";
    pool.query(sql, function (err, rows, fields) {
        if (err) throw err;
        let resultArray = [];
        
        rows.forEach( async (movie) => {
          let genreNameArray = ["temp"];
          // The next line is giving an error saying we cannot do this many sql queries
          //let genreNameArray = await getGenreNamesFromDB(movie.movie_id);
          
          let result = {
            title: movie.title,
            imageUrl: movie.image_url,
            rating: movie.rating,
            movieID: movie.movie_id,
            release_date: movie.release_date, // formats date to locale's style
            overview: movie.description,
            genres: genreNameArray,
          };
          resultArray.push(result);
        });
        
        resolve(resultArray);
    });
  });
}

/**
 * Get the names of all genres associated with the movie id
 * @param {movieID} the movie
 * @return {resultArray} an array of genres
 */ 
function getGenreNamesFromDB(movieID){
  return new Promise (function (resolve, reject){
    let sql = "SELECT genre_name FROM genre WHERE movie_id = ?;";
    pool.query(sql, [movieID], function (err, rows, fields) {
        
        if (err) throw err;
        let resultArray = [];
        
        rows.forEach( async (genre) => {
          resultArray.push(genre.genre_name);
        });
        resolve(resultArray);
    });
  });
}