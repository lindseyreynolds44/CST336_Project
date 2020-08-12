/* global $ */

var results; // list of movies resulted from searching for the keywords
var featuredResults; // list of featured movies
var selectedMovieID; // current selected moive ID from the search
var adminSearchResults; // list of search results from WEB
var adminDBResults; // list of movies from Database

/******************************************************************************
 *                             Sign In Page Code
 *******************************************************************************/

$(document).ready(function () {
  // Check is the username is available
  $("#new-username").on("change", function () {
    let user = $("#new-username").val();

    $.ajax({
      method: "GET",
      url: "/isUsernameAvailable",
      data: {
        username: user,
      },
      success: function (data, status) {
        if (!data.response) {
          $("#usernameError").html(`This username is not available`);
          $("#usernameError").css("color", "red");
        } else {
          $("#usernameError").html("");
        }
      },
    }); //ajax
  });

  /******************************************************************************
   *                            Admin page Code
   *******************************************************************************/

  // Display the database in table format on "Database table" button click
  $("#db-btn").on("click", function () {
    $("#db-results").html("");
    $.ajax({
      method: "GET",
      url: "/api/getMoviesFromDB",
      success: function (data, status) {
        adminDBResults = data.moviesInDB;
        let html =
          "<table id='admin-db-table'>" +
          "<tr> <th style='width:100px'>Movie ID</th> <th style='width:200px'>Title</th>" +
          "<th style='width:50px'>Price($)</th> <th style='width:50px'>Update</th>" +
          "<th style='width:50px' >Delete</th> </tr>";
        data.moviesInDB.forEach((movie, i) => {
          html += "<tr>";
          html += `<td> ${movie.movie_id} </td>`;
          html += `<td> ${movie.title} </td>`;
          html += `<td class='admin-db-price' contenteditable='true' > ${movie.price} </td>`;
          html += `<td> <button id="admin-update-btn" class="btn btn-outline-success" value=${i}>Update</button> </td>`;
          html += `<td> <button id="admin-delete-btn" class="btn btn-outline-success" value=${i}>Delete</button> </td>`;
          html += "</tr>";
        });
        html += "</table>";
        $("#db-results").html(html);
      },
    }); //ajax
  });

  // Update the price of a movie in the Database table
  $("#db-results").on("click", "#admin-update-btn", function () {
    $(this).html("Updated");
    let currentRow = $(this).closest("tr");
    let index = $(this).val();
    let price = Number(currentRow.find(".admin-db-price").html());
    console.log("Update:" + adminDBResults[index].movie_id + ", " + price);

    if (!Number.isNaN(price) && price > 0.0) {
      // update price only need movie id and price
      updateDB(
        "update",
        adminDBResults[index].movie_id,
        null,
        null,
        null,
        null,
        null,
        null,
        price
      );
    } else {
      console.log("price is invalid");
    }
  });

  // Delete a movie from the Database table
  $("#db-results").on("click", "#admin-delete-btn", function () {
    let index = $(this).val();
    console.log("Delete Movie from DB:" + adminDBResults[index].movie_id);
    updateDB("delete", adminDBResults[index].movie_id);

    // Disable buttons and price input
    $(this).html("Deleted");
    let currentRow = $(this).closest("tr");
    currentRow.find(".admin-db-price").prop("contenteditable", false);
    currentRow.find(".admin-delete-btn").prop("disabled", true);
    currentRow.find(".admin-update-btn").prop("disabled", true);
  });

  // Display search results from a TMDB web
  $("#admin-search-form").on("submit", function (e) {
    $("#admin-search-results").html(""); // clean up the search table content
    e.preventDefault();
    let keyword = $("#admin-search-text").val().trim();
    if (keyword == "") {
      $("#admin-search-warning").css("color", "red");
      $("#admin-search-warning").html("** Keyword is required!");
    } else {
      console.log("Search Web:", keyword);
      $("#admin-search-warning").html("");
      $.ajax({
        method: "get",
        url: "/search",
        data: {
          search_string: keyword,
        },
        success: function (data, status) {
          console.log(data);
          adminSearchResults = data;
          let html =
            "<table id='admin-search-table'><th style='width:100px'>Movie ID</th>" +
            "<th style='width:100px'>Title</th> <th style='width:60px'>Image</th>" +
            "<th style='width:30px'>Rating</th> <th style='width:100px'>Date</th> <th style='width:150px'>Description</th>" +
            "<th style='width:80px'>Genres</th> <th style='width:50px'>Price($)</th> <th style='width:50px'>Action</th> </tr>";

          data.forEach((movie, i) => {
            let genreString = "";
            movie.genres.forEach((name) => {
              genreString += name;
              genreString += " ";
            });
            html += `<tr id='admin-search-row' value=${i}>`;
            html += `<td class='movie-id'> ${movie.movieID} </td>`;
            html += `<td> ${movie.title} </td>`;
            html += `<td> <img height='80' src='${movie.imageUrl}' alt='${movie.title}' > </td>`;
            html += `<td> ${movie.rating} </td>`;
            html += `<td> ${movie.release_date} </td>`;
            html += `<td > ${movie.overview} </td>`;
            html += `<td > ${genreString} </td>`;
            html += `<td class='admin-search-price' contenteditable='true'> 5.99 </td>`;
            html += `<td> <button id='admin-add-btn' class='btn btn-outline-success' value=${i}>Add Movie</button> </td>`;
            html += "</tr>";
          });
          html += "</table>";
          $("#admin-search-results").html(html);
        },
      }); //ajax
    }
  }); //admin search

  $("#admin-search-results").on("click", "#admin-add-btn", function () {
    console.log("Add button is clicked");

    // clean the db table when this action is clicked,
    // otherwise need to make ajax call to reload the db table
    $("#db-results").html(""); // close the db table if a movie is added or removed

    let currentRow = $(this).closest("tr");
    let index = $(this).val();
    let price = Number(currentRow.find(".admin-search-price").html());
    console.log(
      "Add Movie:" + adminSearchResults[index].movieID + ", " + price
    );

    // Check if the button says "Add" or "Remove"
    if ($(this).html() == "Add Movie") {
      $(this).html("Remove Movie");
      if (!Number.isNaN(price) && price > 0.0) {
        // update price only need movie id and price
        updateDB(
          "add",
          adminSearchResults[index].movieID,
          adminSearchResults[index].title,
          adminSearchResults[index].imageUrl,
          adminSearchResults[index].rating,
          adminSearchResults[index].release_date,
          adminSearchResults[index].overview,
          adminSearchResults[index].genres,
          price
        );
      } else {
        console.log("price is invalid");
      }
    } else {
      $(this).html("Add Movie");
      updateDB("delete", adminSearchResults[index].movieID);
    }
  });

  // Function to add, delete or update the price of a record in the movie table
  function updateDB(
    action,
    movieID,
    title,
    imageUrl,
    rating,
    release_date,
    overview,
    genre,
    price
  ) {
    $.ajax({
      method: "get",
      url: "/api/updateDB",
      data: {
        action: action,
        movieID: movieID,
        title: title,
        imageUrl: imageUrl,
        rating: rating,
        release_date: release_date,
        overview: overview,
        genre: genre,
        price: price,
      },
      success: function (data, status) {
        console.log("updateDB done!");
        // if action="delete" disable the delete button and price change
        if (action == "delete") {
        }
      },
    }); //ajax
  }

  // GET AVERAGE MOVIE PRICE
  $("#admin-get-avg-price").on("click", function () {
    $.ajax({
      method: "get",
      url: "/averagePrice",
      success: (data, status) => {
        console.log("avgPrice", status);
        let avgPrice = data.averagePrice[0].avgPrice.toFixed(2);
        let html = `Average Price: ${avgPrice}`;
        $("#reportResults").html(html);
      },
    }); //ajax
  });
  // GET AVERAGE MOVIE RATING
  $("#admin-get-avg-rating").on("click", function () {
    $.ajax({
      method: "get",
      url: "/averageRating",
      success: (data, status) => {
        console.log("avgRating:", status);
        let avgRating = data.averageRating[0].avgRating.toFixed(2);
        let html = `Average Rating: ${avgRating}`;
        $("#reportResults").html(html);
      },
    }); //ajax
  });

  // GET MOST PURCHASED MOVIE
  $("#admin-get-most-inCart").on("click", () => {
    $.ajax({
      method: "get",
      url: "/mostInCart",
      success: (data, status) => {
        console.log("mostPurchased:", status);
        let mostInCart = data.mostInCart[0];
        let html =
          `Most Popular Movie in Cart <br>` +
          `Title: ${mostInCart.title} <br>` +
          `Times added: ${mostInCart.num_times}`;
        $("#reportResults").html(html);
      },
    });
  });

  /******************************************************************************
   *                           Home Page Code
   *******************************************************************************/

  $("#home-form").on("submit", function (e) {
    if (!isFormValid()) {
      e.preventDefault(); // not to reload the page
      // check the email
      $("#home-warning").css("color", "red");
      $("#home-warning").html("** Email address is required!");
    }
  });

  function isFormValid() {
    if ($("#home-text").val() == "") {
      return false;
    }
    return true;
  }

  /**
   * Index Page action event and functions
   */
  hideMovieDetail(); //hide the movie detail when the page is freshly loaded

  displayFeaturedMovies(featuredResults); // display all the featured Movies

  function hideMovieDetail() {
    if ($("body").attr("page") == "index") {
      $("#selected-movie-container").hide();
    }
  }

  // Request to search for movies using an AJAX call to server "/index" route
  // when keyword is entered
  $("#search-form").on("submit", function (e) {
    e.preventDefault(); // not going to reload the page
    let keyword = $("#search-text").val().trim();
    console.log("search:" + keyword);
    if (keyword == "") {
      $("#search-warning").css("color", "red");
      $("#search-warning").html("** Keyword is required!");
    } else {
      $("#search-warning").html(""); // clear any warning message
      $.ajax({
        method: "get",
        url: "/search",
        data: {
          search_string: keyword,
        },
        success: function (data, status) {
          //result = JSON.parse(data);
          console.log(data);
          results = data;

          // display all the movie posters in the results
          $("#featured-header").html(""); // remove the featured header
          displayAllMovies(results);

          // display the first movie image/trailer and detail from the list
          // displayMovieTrailer(0);
          displayMovieImage(0);
          displayMovieDetail(0);
          $("#selected-movie-container").show();
        },
      }); //ajax
    }
  }); //index - keyword search

  // event for dynamically filled content
  $("#resultsContainer").on("click", ".movie-poster", function () {
    console.log("A movie is clicked");
    let movieIndex = Number($(this).attr("value"));
    console.log("Movie Index:" + movieIndex);
    displayMovieImage(movieIndex);
    displayMovieDetail(movieIndex);
    $("#selected-movie-container").show();
    selectedMovieID = results[movieIndex].movieID; // set it as current selected movie
    console.log("SELECTED MOVIE ID", selectedMovieID);
    window.scrollTo(0, 0); // scroll back to the top
  });

  // display featured movies
  function displayFeaturedMovies(movies) {
    if ($("body").attr("page") == "index") {
      results = movies;
      $("#featured-header").html("Recommended Movies");
      displayAllMovies(results);
    }
  }

  // display all the movie poster with date
  function displayAllMovies(movies) {
    $("#resultsContainer").html(""); // clean up the container

    // starts to construct the container content
    let htmlString = "";
    var i;
    for (i in movies) {
      // console.log(movies[i]);
      let imgPath = movies[i].imageUrl;
      htmlString += "<div class='poster-box'>";
      htmlString += `<img class='movie-poster' src='${imgPath}' alt='${movies[i].title}' width='200' height='300' value=${i}>`;
      htmlString += `<br> ${movies[i].release_date}`;
      htmlString += "</div>";
    }

    $("#resultsContainer").append(htmlString); // display all the found movie posters with release dates
  }

  // display the poster image of the movie with given index
  function displayMovieImage(index) {
    let htmlString = `<img class='movie-image' src='${results[index].imageUrl}' alt='${results[index].title}' width='400' height='600' value=${index}>`;
    $("#selected-image").html(htmlString);
  }

  // display the movie detail
  function displayMovieDetail(index) {
    $("#synopsis-content").html(results[index].overview);
    $("#rating-content").html(results[index].rating);
    $("#release-content").html(results[index].release_date);
    // display the list of genres the movie belongs to
    let genreString = "";
    console.log(results[index].genres);
    results[index].genres.forEach((name) => {
      console.log("Genre: ", name);
      genreString += name;
      genreString += " ";
    });
    $("#genre-content").html(genreString);
  }

  // event handler when "Add to Cart" button is clicked
  $("#add-movie").on("click", function (e) {
    // let movieInfo = results[selectedMovieID];
    let movieInfo = results.filter((movie) => {
      console.log(
        `${movie.movieID}: ${selectedMovieID} ?? ${
          movie.movieID == selectedMovieID ? "True" : "False"
        }`
      );
      return movie.movieID === selectedMovieID;
    });
    console.log("TESTING " + results[0]);
    console.dir("Movie Info:" + movieInfo);

    $.ajax({
      method: "get",
      url: "/updateCart",
      data: {
        // movieInfo: movieInfo,
        action: "add",
        movie_id: movieInfo[0].movieID,
        title: movieInfo[0].title,
        release_date: movieInfo[0].release_date,
        description: movieInfo[0].overview,
        image_url: movieInfo[0].imageUrl,
        rating: movieInfo[0].rating,
        genres: movieInfo[0].genres,
      },
      success: function (data, status) {
        console.log("Movie is added");
      },
    }); // end of ajax
  });
});
