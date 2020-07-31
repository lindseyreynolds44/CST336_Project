const request = require("request");
const pool = require("../dbPool.js");
const API_KEY = process.env.API_KEY;

exports.displayIndex = async (req, res) => {
  let query = "Jack Reacher";
  let resultArray = await getMovie(query);
  res.render("index", { resultArray: resultArray });
};

async function getMovie(query) {
  // return new Promise(function (resolve, reject) {
  // reorganized to make the url easier to manipulate and read
  // qs adds the query string after the url.
  let configUrl = {
    url: "https://api.themoviedb.org/3/configuration",
    qs: {
      api_key: API_KEY,
    },
  };
  let requestUrl = {
    url: "https://api.themoviedb.org/3/search/movie",
    qs: {
      api_key: API_KEY,
      query: query,
    },
  };
  /**
   * I had a config function made. I got rid of it. I think i'll add it back in.
   * I think we also need to have the genrelist and the config call be called at a global
   * level. I tried getting it to do that earlier but I had some issues with
   * getting it to work properly
   */
  const config = await callAPI(configUrl);
  let genreList = await getGenre();
  let parsedData = await callAPI(requestUrl);
  let base_url = config.images.base_url;
  let resultArray = [];
  console.log(genreList.genres.length);

  parsedData.results.forEach((movie) => {
    // creates Date object for formatting
    let date = new Date(movie.release_date);
    /**
     * *********************************************************
     * We should move this to it's own function
     */
    let genreNameArr = [];
    movie.genre_ids.forEach((genreID) => {
      genreList.genres.forEach((gl) => {
        genreID == gl.id ? genreNameArr.push(gl.name) : "";
      });
    });
    console.log(genreNameArr);
    /**
     * ***********************************************************
     */
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

  // request(requestUrl, function (error, response, body) {
  //   //body is the string that is retrieved
  //   //check that the request was successful
  //   if (!error && response.statusCode == 200) {
  //     let parsedData = JSON.parse(body);
  //     let numResults = parsedData.total_results;
  //     let resultArray = [];
  //     for (let i = 0; i < numResults; i++) {
  //       let result = {
  //         title: parsedData.results[i].original_title,
  //         overview: parsedData.results.overview,
  //         movieID: parsedData.results[i].id,
  //       };
  //       resultArray.push(result);
  //     }
  //     resolve(resultArray);
  //   } else {
  //     console.log("error:", error);
  //     console.log("statusCode:", response && response.statusCode);
  //     reject(error);
  //   }
  // });
}

/**
 * This function receives a request URL object with the URL and params
 * to call the api and returns the parsed results
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
async function getGenre() {
  let genreUrl = {
    url: "https://api.themoviedb.org/3/genre/movie/list",
    qs: {
      api_key: API_KEY,
    },
  };
  let genreList = await callAPI(genreUrl);
  return genreList;
}
