const request = require("request");
const pool = require("../dbPool.js");
const session = require("express-session");
const bcrypt = require("bcrypt");
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
 *  --- DONE ---
 */
exports.displaySignInPage = async (req, res) => {
  //res.redirect("/index"); // Only for testing purposes
  //res.render("sign-in");
  res.render("sign-in"); // for testing home page
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
  res.render("index", { resultArray: resultArray });
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
    let sql =
      "INSERT INTO user (admin_privledges, username, password, firstName, lastName) VALUES (false, ?, ?, ?, ?);";
    let sqlParams = [usernameInput, hash, firstNameInput, lastNameInput];
    pool.query(sql, sqlParams, function (err, rows, fields) {
      if (err) throw err;
      let userValues = {
        username: usernameInput,
        firstName: firstNameInput,
        lastName: lastNameInput,
      };
      res.render("confirmation", { userValues: userValues });
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
 * --- DONE ---
 */
exports.displaySearchResults = async (req, res) => {
  let query = req.query.search_string;
  //query = "Jack Reacher"; // For testing purposes only
  let resultArray = await getMovie(query);

  //   res.render("selection", { resultArray: resultArray });

  //MAIN CHANGES
  //res.render("selection", {"resultArray": resultArray});
  // console.log(resultArray);
  res.send(resultArray); // index page will be used as selection as well without reloading the page
  //MAIN END
};

/**
 * Handles the GET "/updateCart" route
 * --- DONE ( DAN ) ---
 */
exports.updateCart = async (req, res) => {
  let user_id = req.session.name;
  let movie_id = parseInt(req.query.movie_id);
  let title = req.query.title;
  let release_date = req.query.release_date;
  let description = req.query.description;
  let image_url = req.query.image_url;
  let rating = req.query.rating;
  let action = req.query.action; //add or delete

  let sql = "";
  let sqlParams;

  // check if this is an "add" or "delete" action
  switch (action) {
    case "add":
      //add here
      // INSERT MOVIE TO MOVIE TABLE
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
      // INSERT GENRES INTO GENRE TABLE
      let genres = req.query.genres;
      sql =
        "INSERT INTO genre (genre_id, movie_id, genre_name) VALUES (?, ?, ?)";
      for (genre of genres) {
        for (names of genreNames.genres) {
          if (names.id == parseInt(genre)) {
            sqlParams = [parseInt(genre), movie_id, names.name];
            await callDB(sql, sqlParams);
          }
        }
      }
      // INSERT MOVIE INTO CART TABLE
      sql = "INSERT INTO cart (user_id, movie_id) VALUES (?, ?)";
      sqlParams = [user_id, movie_id];
      await callDB(sql, sqlParams);
      res.send({ status: 200 });
      break;
    case "delete":
      //delete here
      sql = "DELETE FROM cart WHERE user_id = ? AND movie_id = ?;";
      sqlParams = [user_id, movie_id];
      await callDB(sql, sqlParams);
      res.send({ status: 200 });
      break;
  }
};

/**
 * Handles the GET "/displayCartPage" route
 * --- DONE ( DAN ) ---
 */
exports.displayCartPage = async (req, res) => {
  let user_id = req.session.name;
  let sql =
    "SELECT movie_id, title, image_url, price FROM cart JOIN movie USING (movie_id) WHERE user_id = ?";
  let cartContents = await callDB(sql, user_id);

  console.log("# of items in cart:", cartContents.length); // diagnostic
  //console.log(cartContents); // diagnostic
  res.render("shoppingcart", { cartContents: cartContents });
};

/**
 * Handles the GET "/getMoviesFromDB" route
 * --- PENDING ( Lindsey ) ---
 */
exports.getMoviesFromDB = async (req, res) => {
  let sql = "SELECT movie_id, title, price FROM movie;";
  let moviesInDB = await callDB(sql);
  res.send({ moviesInDB: moviesInDB });
};

/**
 * Handles the GET "/api/updateDB" route
 * --- PENDING ( Lindsey ) ---
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
  if(action == "add"){
    genre = req.query.genre.toString();
    genreArr = genre.split(',');
  }
  // Add/Delete record from movie table
  switch (action) {
      case "add":
        sql = "REPLACE INTO movie (movie_id, title, image_url, rating, " +
          "release_date, description, price) VALUES (?, ?, ?, ?, ?, ?, ?);";
        sqlParams = [movie_id, title, image_url, rating, release_date, description, price];
        break;
      case "delete":
        sql = "DELETE FROM movie WHERE movie_id = ?";
          sqlParams = [movie_id];
          break;
      case "update": // update the price
        sql = "UPDATE movie SET price = ? WHERE movie_id = ?";
        sqlParams = [price, movie_id];
        break;
  }//switch
  await callDB(sql, sqlParams);
  // Add all genres into the genre table that are associated with the movie_id
  if(action == "add"){
    sql = "REPLACE INTO genre (genre_id, movie_id, genre_name) VALUES (?, ?, ?);";
    genreArr.forEach( async (genre) => {
      let genreID = await getGenreIDFromName(genre);
      sqlParams = [genreID, movie_id, genre];
      await callDB(sql, sqlParams);
    });
  }
};




// exports.updateDB = async (req, res) => {
//   let sql;
//   let sqlParams;
//   let action = req.query.action;
//   let movie_id = req.query.movieID;
//   let title, image_url, rating, release_date, description, genreArr, price;

//   price = req.query.price;
//   title = req.query.title;
//   image_url = req.query.imageUrl;
//   rating = req.query.rating;
//   release_date = req.query.release_date;
//   description = req.query.overview;

//   console.log(typeof req.query.genre);
//   console.log(req.query.genre);

//   if (action == "add") {
//     genreArr = req.query.genre;
//     // genreArr = req.query.genre.split(",");
//   }

//   // Add/Delete record from movie table
//   switch (action) {
//     case "add":
//       sql =
//         "REPLACE INTO movie (movie_id, title, image_url, rating, " +
//         "release_date, description, price) VALUES (?, ?, ?, ?, ?, ?, ?);";
//       sqlParams = [
//         movie_id,
//         title,
//         image_url,
//         rating,
//         release_date,
//         description,
//         price,
//       ];
//       break;
//     case "delete":
//       sql = "DELETE FROM movie WHERE movie_id = ?";
//       sqlParams = [movie_id];
//       break;
//     case "update": // update the price
//       sql = "UPDATE movie SET price = ? WHERE movie_id = ?";
//       sqlParams = [price, movie_id];
//       break;
//   } //switch
//   await callDB(sql, sqlParams);
//   // Add all genres into the genre table that are associated with the movie_id
//   if (action == "add") {
//     sql =
//       "INSERT INTO genre (genre_id, movie_id, genre_name) VALUES (?, ?, ?);";
//     genreArr.forEach(async (genre) => {
//       let genreID = await getGenreIDFromName(genre);
//       sqlParams = [genreID, movie_id, genre];
//       await callDB(sql, sqlParams);
//     });
//   }
// };

/**
 * Handles the GET  "/averagePrice" route
 */
exports.getAvgPrice = async (req, res) => {
  let sql = "SELECT AVG(price) AS avgPrice FROM movie";
  const averagePrice = await callDB(sql);
  // res.send({ status: 200, averagePrice: averagePrice });
  res.send({ averagePrice: averagePrice });
};

/**
 * Handles the GET "/averageRating" route
 */
exports.getAvgRating = async (req, res) => {
  let sql = "SELECT AVG(rating) AS avgRating FROM movie";
  const averageRating = await callDB(sql);
  // res.send({ status: 200, averageRating: averageRating });
  res.send({ averageRating: averageRating });
};

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

  //   parsedData.results.forEach((movie) => {
  //     // creates Date object for formatting
  //     let date = new Date(movie.release_date);

  // MAIN CHANGES
  console.log("getMovie");
  //console.log(parsedData);

  // remove async from forEach, otherwise the return resultArray executed before the resultArray is ready
  parsedData.results.forEach((movie) => {
    // creates Date object for formatting
    let date = new Date(movie.release_date);

    // change genreToString to normal function rather than async function
    //MAIN END

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
  // console.log(resultArray);
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
 * Create an array of all genres, including their id and name
 * How to call: genrePairArray[0].id OR genrePairArray[0].name
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
  genrePairArray = await getGenrePairs();
  console.log("Loaded config");
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
    let sql = "SELECT * FROM movie ORDER BY rating DESC LIMIT 10;";
    pool.query(sql, function (err, rows, fields) {
      if (err) throw err;
      let resultArray = [];

      rows.forEach(async (movie) => {
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

function getGenreNamesFromDB(movieID) {
  return new Promise(function (resolve, reject) {
    let sql = "SELECT genre_name FROM genre WHERE movie_id = ?;";
    pool.query(sql, [movieID], function (err, rows, fields) {
      if (err) throw err;
      let resultArray = [];

      rows.forEach(async (genre) => {
        resultArray.push(genre.genre_name);
      });
      resolve(resultArray);
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
