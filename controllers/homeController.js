const request = require("request");
const pool = require("../dbPool.js");
const session = require("express-session");
const bcrypt = require("bcrypt");
// const { parse } = require("dotenv/types");
require("dotenv").config();
const API_KEY = process.env.API_KEY;
const saltRounds = 10;
//global vars
var config;
var genreNames;
var genrePairArray; // Array of genre name and id pairs
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
 * Displays the sign in page
 */
exports.displaySignInPage = async (req, res) => {
  res.render("sign-in");
};

/**
 * Handles the GET "/index" route
 * Gets the top 10 rated movies from our database and renders
 * them to index.ejs to be displayed
 */
exports.displayIndexPage = async (req, res) => {
  let resultArray = await getFeaturedMovies();
  res.render("index", { resultArray: resultArray, page_name: "home" });
};

/**
 * Handles the POST "/createAccount" route
 * Creates a new account in our database
 */
exports.createAccount = (req, res) => {
  let usernameInput = req.body.username;
  let passwordInput = req.body.password;
  let firstNameInput = req.body.firstName;
  let lastNameInput = req.body.lastName;

  // Use bcrypt to create a decrypted password
  bcrypt.hash(passwordInput, saltRounds, function (err, hash) {
    let sql =
      "INSERT INTO user (admin_privledges, username, password, firstName, " +
      "lastName) VALUES (false, ?, ?, ?, ?);";
    let sqlParams = [usernameInput, hash, firstNameInput, lastNameInput];
    pool.query(sql, sqlParams, function (err, rows, fields) {
      if (err) throw err;
      let userValues = {
        username: usernameInput,
        firstName: firstNameInput,
        lastName: lastNameInput,
      };
      res.render("sign-in");
    });
  });
};

/**
 * Handles the GET "/isUsernameAvailable" route
 * Check if the username already exists in our database
 */
exports.isUsernameAvailable = (req, res) => {
  let username = req.query.username;
  let sql = "SELECT username FROM user WHERE username = ?;";
  pool.query(sql, [username], function (err, rows, fields) {
    if (err) throw err;
    let response;

    // This username is already in use
    if (rows.length > 0) {
      response = false;
    } else {
      response = true;
    }
    res.send({ response: response });
  });
};

/**
 * Handles the GET "/search" route
 * Searches the movies API and sends the results back to index.ejs
 */
exports.displaySearchResults = async (req, res) => {
  let query = req.query.search_string;
  let resultArray = await getMovie(query);
  res.send(resultArray);
};

/**
 * Handles the GET "/updateCart" route
 * Adds or deletes records from our database
 */
exports.updateCart = async (req, res) => {
  let user_id = req.session.name;
  let movie_id = parseInt(req.query.movie_id);
  let title = req.query.title;
  let release_date = req.query.release_date;
  let description = req.query.description;
  let image_url = req.query.image_url;
  let rating = req.query.rating;
  let genres = req.query.genres;
  let action = req.query.action; //add or delete

  let sql = "";
  let sqlParams;

  // Check if this is an "add" or "delete" action
  switch (action) {
    case "add":
      // Insert movie into the movie table
      sql =
        "REPLACE INTO movie (movie_id, title, release_date, description, image_url, rating) VALUES (?,?,?,?,?,?)";
      sqlParams = [
        movie_id,
        title,
        release_date,
        description,
        image_url,
        rating,
      ];
      await callDB(sql, sqlParams);
      // Insert genres into genre table
      sql =
        "REPLACE INTO genre (genre_id, movie_id, genre_name) VALUES (?, ?, ?)";
      for (genreName of genres) {
        let genre_id = await getGenreIDFromName(genreName);
        sqlParams = [genre_id, movie_id, genreName];
        await callDB(sql, sqlParams);
      }
      
      // Insert movie into the cart table
      sql = "REPLACE INTO cart (user_id, movie_id) VALUES (?, ?)";
      sqlParams = [user_id, movie_id];
      await callDB(sql, sqlParams);
      res.send({ status: 200 });
      break;

    case "delete":
      // Delete movie from the cart table
      sql = "DELETE FROM cart WHERE user_id = ? AND movie_id = ?;";
      sqlParams = [user_id, movie_id];
      await callDB(sql, sqlParams);
      res.send({ status: 200 });
      break;
  }
};

/**
 * Handles the GET "/displayCartPage" route
 * Display the shopping cart with all the current user's cart items
 */
exports.displayCartPage = async (req, res) => {
  let user_id = req.session.name;
  // Select all the movies in this user's cart
  let sql =
    "SELECT movie_id, title, image_url, price FROM cart JOIN movie USING (movie_id) WHERE user_id = ?";
  let cartContents = await callDB(sql, user_id);

  res.render("shoppingcart", {
    cartContents: cartContents,
    page_name: "shoppingCart",
  });
};

/**
 * Handles the GET "/getMoviesFromDB" route
 * Get all movies from our database to send to the admin page
 */
exports.getMoviesFromDB = async (req, res) => {
  let sql = "SELECT movie_id, title, price FROM movie;";
  let moviesInDB = await callDB(sql);
  res.send({ moviesInDB: moviesInDB });
};

/**
 * Handles the GET "/api/updateDB" route
 * Add, delete or update the price of records in the movie and genre tables
 */
exports.updateDB = async (req, res) => {
  let sql;
  let sqlParams;
  let genre, genreArr;
  let action = req.query.action;
  let movie_id = req.query.movieID;
  let price = req.query.price;
  let title = req.query.title;
  let image_url = req.query.imageUrl;
  let rating = req.query.rating;
  let release_date = req.query.release_date;
  let description = req.query.overview;

  if (action == "add") {
    genre = req.query.genre.toString();
    genreArr = genre.split(",");
  }
  // Add/Delete record from movie table
  switch (action) {
    case "add":
      // Insert movie into the movie table
      sql =
        "REPLACE INTO movie (movie_id, title, image_url, rating, " +
        "release_date, description, price) VALUES (?, ?, ?, ?, ?, ?, ?);";
      sqlParams = [
        movie_id,
        title,
        image_url,
        rating,
        release_date,
        description,
        price,
      ];
      break;
    case "delete":
      // Delete movie from the movie table
      sql = "DELETE FROM movie WHERE movie_id = ?";
      sqlParams = [movie_id];
      break;
    case "update":
      // Update this movie's price
      sql = "UPDATE movie SET price = ? WHERE movie_id = ?";
      sqlParams = [price, movie_id];
      break;
  } //switch

  // Add or Delete records from movie table
  await callDB(sql, sqlParams);

  // Add all genres into the genre table that are associated with the movie_id
  if (action == "add") {
    sql =
      "REPLACE INTO genre (genre_id, movie_id, genre_name) VALUES (?, ?, ?);";
    genreArr.forEach(async (genre) => {
      let genreID = await getGenreIDFromName(genre);
      sqlParams = [genreID, movie_id, genre];
      await callDB(sql, sqlParams);
    });
  }
  res.send({ status: 200 });
};

/**
 * Handles the GET  "/averagePrice" route
 * Get the average price of all movies in our database
 */
exports.getAvgPrice = async (req, res) => {
  let sql = "SELECT AVG(price) AS avgPrice FROM movie";
  const averagePrice = await callDB(sql);
  res.send({ averagePrice: averagePrice });
};

/**
 * Handles the GET "/averageRating" route
 * Get the average rating of all movies in our database
 */
exports.getAvgRating = async (req, res) => {
  let sql = "SELECT AVG(rating) AS avgRating FROM movie";
  const averageRating = await callDB(sql);
  res.send({ averageRating: averageRating });
};

/**
 * Handles the GET "/getMostInCart" route
 * Get the movie that appears most often in user's carts
 */
exports.getMostInCart = async (req, res) => {
  let sql =
    "SELECT cart.movie_id, title, COUNT(cart.movie_id) AS num_times FROM cart JOIN movie ON cart.movie_id = movie.movie_id GROUP BY cart.movie_id ORDER BY num_times DESC LIMIT 1;";
  const mostInCart = await callDB(sql);
  res.send({ mostInCart: mostInCart });
};

/*******************************************************************************
 *                            API functions                                    *
 ******************************************************************************/

/**
 * Loads the static configuration information from the API
 */
async function loadConfig() {
  let requestUrl = {
    url: "https://api.themoviedb.org/3/configuration",
    qs: {
      api_key: API_KEY,
    },
  };
  // Sets values to global variables
  config = await callAPI(requestUrl);
  genreNames = await getGenreNames();
  genrePairArray = await getGenrePairs();
  console.log("Loaded config");
}

/**
 * Retrieves movie data from the API based on a keyword
 * @param {String} query
 * @return {}
 */
async function getMovie(query) {
  // Request URL including the API key and the search term
  let requestUrl = {
    url: "https://api.themoviedb.org/3/search/movie",
    qs: {
      api_key: API_KEY,
      query: query,
    },
  };
  let parsedData = await callAPI(requestUrl);
  let base_url = config.images.base_url;
  let resultArray = [];

  parsedData.results.forEach((movie) => {
    // Create Date object for formatting
    let date = new Date(movie.release_date);
    let genreNameArr = genreToString(movie.genre_ids);

    let result = {
      title: movie.original_title,
      imageUrl: base_url + "w342" + movie.poster_path,
      rating: movie.vote_average,
      movieID: movie.id,
      release_date: date.toLocaleDateString(), // format date to locale's style
      overview: movie.overview,
      genres: genreNameArr,
      price: 5.99,
    };
    resultArray.push(result);
  });
  return resultArray;
}

/**
 * This function receives a request URL object with the URL and params
 * to call the api and returns the parsed results.
 * @param {Object} requestUrl
 */
function callAPI(requestUrl) {
  return new Promise((resolve, reject) => {
    request(requestUrl, function (error, response, body) {
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
 * Matches a movie's genreIDs to the API's genre names and returns the
 * corresponding name 
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
 * Create an array of all genres, pairing their id with their name
 */
function getGenrePairs() {
  return new Promise((resolve, reject) => {
    let genreArray = [];
    genreNames.genres.forEach((genre) => {
      let pair = {
        id: genre.id,
        name: genre.name,
      };
      genreArray.push(pair);
    });
    resolve(genreArray);
  });
}

/**
 * Get the genre name from its corresponding id
 * @param {string} genreName
 * @return {int} returnID
 */
function getGenreIDFromName(genreName) {
  return new Promise((resolve, reject) => {
    let returnID = 0;
    genrePairArray.forEach((genre) => {
      if (genre.name == genreName) {
        returnID = genre.id;
      }
    });
    resolve(returnID);
  });
}



/*******************************************************************************
 *                            Database Functions                               *
 ******************************************************************************/

/**
 * Get the top ten rated movies from our Database
 * @return {resultArray} an array containing 10 JSON-formatted movies
 */
async function getFeaturedMovies() {
  return new Promise(function (resolve, reject) {
    // Get the top ten rated movies from our database
    let sql =
      "SELECT movie.movie_id, title, release_date, description, image_url," +
      " rating, price, genre_name FROM movie JOIN genre on movie.movie_id =" +
      " genre.movie_id ORDER BY rating DESC, movie.movie_id;";
    pool.query(sql, function (err, rows, fields) {
      if (err) throw err;
      let movieObjArray = [];
      let movieID = 0;
      let index = -1;

      // Loop through all the rows returned from the query
      rows.forEach(async (record) => {
        // If this is a new movie ID, create a movie object for it
        if (movieID != record.movie_id) {
          movieID = record.movie_id;
          let movie = {
            title: record.title,
            imageUrl: record.image_url,
            rating: record.rating,
            movieID: record.movie_id,
            release_date: record.release_date, // formats date to locale's style
            overview: record.description,
            genres: [],
            price: record.price,
          };
          index++;
          movieObjArray.push(movie);
          movieObjArray[index].genres.push(record.genre_name);

          // Otherwise, this is a repeat movie_id, with a new genre
        } else {
          // Add the genre from this record to this movie's genre list
          movieObjArray[index].genres.push(record.genre_name);
        }
      });
      // Send back all ten movies in JSON format, including their details
      resolve(movieObjArray);
    });
  });
}

/**
 * Overloaded function to call DB with or without params
 * @param {String} sql
 * @param {String} params
 */
function callDB(sql, params) {
  console.log(sql); // Diagnostic
  console.log(params); // Diagnostic
  if (arguments.length == 2) {
    return new Promise((resolve, reject) => {
      pool.query(sql, params, (err, rows, fields) => {
        if (err) throw err;
        resolve(rows);
      }); // query
    }); // promise
  } else {
    return new Promise((resolve, reject) => {
      pool.query(sql, (err, rows, fields) => {
        if (err) throw err;
        resolve(rows);
      }); // query
    }); // promise
  }
}
