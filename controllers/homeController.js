const request = require("request");
const pool = require("../dbPool.js");
const API_KEY = process.env.API_KEY;
//global vars
var config;
let minutes = 1;
let the_interval = minutes * 60 * 1000;
//loads the config
loadConfig();
// loads the config at every X amount of time.
setInterval(loadConfig, the_interval);

/******************************************************************************
 *                                  Routes?
 ******************************************************************************/

/**
 * Handles the GET "/" request
 * @param {*} req
 * @param {*} res
 */
exports.displayIndex = async (req, res) => {
  let query = "Jack Reacher";
  let resultArray = await getMovie(query);
  res.render("index", { resultArray: resultArray });
  console.log("Index rendered");
};

/*******************************************************************************
 *                                Middleware?
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
  /******************************************************************************
   *                     NOTE For Lindsey 8/1/2020 10:48 PM
   * ****************************************************************************
   * I think we also need to have the genreNames to be called at a global
   * level. Mainly because it's mostly static data that we don't want to be calling
   * with every request. What do you think?
   ******************************************************************************/
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
  });
  return resultArray;
}

/*******************************************************************************
 *                            Helper functions?
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
  console.log("Loaded config");
}
