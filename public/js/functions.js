/* global $ */

var results; // list of movies resulted from searching for the keywords
var featuredResults; // list of featured movies
var selectedMovieID; // current selected moive ID from the search
var adminSearchResults; // list of search results from WEB
var adminDBResults; // list of movies from Database
var moviePrice = 5.99;

$(document).ready(function () {
  // Testing check user availability
  $("#new-username").on("change", function () {
    let user = $("#new-username").val();

    $.ajax({
      method: "GET",
      url: "/isUsernameAvailable",
      data: {
        username: user,
      },
      success: function (data, status) {
        $("#userError").html(`Is this username available? ${data.response}`);
      },
    }); //ajax
  });

  /******************************************************************************
   *                           START Admin page Code
   *******************************************************************************/

  // Testing admin page to display DB info
  $("#db-btn").on("click", function () {
    $("#db-results").html("");
    $.ajax({
      method: "GET",
      url: "/api/getMoviesFromDB",
      success: function (data, status) {
        adminDBResults = data.moviesInDB;
        let html =
          "<table><tr> <th style='width:100px'>Movie ID</th> <th style='width:200px'>Title</th>" +
          "<th style='width:50px'>Price($)</th> <th style='width:50px'>Update</th>" +
          "<th style='width:50px' >Delete</th> </tr>";
        data.moviesInDB.forEach((movie, i) => {
          html += "<tr>";
          html += `<td> ${movie.movie_id} </td>`;
          html += `<td> ${movie.title} </td>`;
          html += `<td class='admin-db-price' contenteditable='true' > ${movie.price} </td>`;
          html += `<td> <button class="admin-update-btn" value=${i}>Update</button> </td>`;
          html += `<td> <button class="admin-delete-btn" value=${i}>Delete</button> </td>`;
          html += "</tr>";
        });
        html += "</table>";
        $("#db-results").html(html);
      },
    }); //ajax
  });

  // UPDATE button on the Database table
  $("#db-results").on("click", "#admin-update-btn", function () {
    $(this).html("Updated");
    let movie_id = 120;
    let price = 4.99;
    /*
        $.ajax({
            method: "GET",
            url: "/api/updateMovie",
            data: {
                "movie_id": movie_id,
                "price": price
            },
            success: function(data, status) {
            }
        }); //ajax
        */
  });

  // DELETE button on the Database table
  $("#db-results").on("click", "#admin-delete-btn", function () {
    $(this).html("Deleted");
    let movie_id = 120;

    updateDB("delete", movie_id);
  });

  // Testing for admin page to display search results
  $("#admin-search-form").on("submit", function (e) {
    $("#admin-search-results").html(""); // clean up the search table content
    e.preventDefault();
    let keyword = $("#admin-search-text").val().trim();
    $.ajax({
      method: "get",
      url: "/search",
      data: {
        search_string: keyword,
      },
      success: function (data, status) {
        adminSearchResults = data;
        let html =
          "<table><th style='width:100px'>Movie ID</th>" +
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
          html += `<td class='admin-search-price' contenteditable='true'> ${moviePrice} </td>`;
          html += `<td> <button class='admin-add-btn' value=${i}>Add Movie</button> </td>`;
          html += "</tr>";
        });
        html += "</table>";
        $("#admin-search-results").html(html);
      },
    }); //ajax
  }); //admin search

  // WORK IN PROGRESS -- need search table to be done, so I know how to traverse the
  // html elements in order to get all the info I need.
  // IMPORTANT NOTE: because the add buttons are added dynamically, this event must
  // be written like this
  $("#db-results").on("click", ".admin-update-btn", function () {
    console.log("Update Button is clicked");
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

  $("#db-results").on("click", ".admin-delete-btn", function () {
    console.log("Delete Button is clicked");
    let index = $(this).val();
    console.log("Delete Movie from DB:" + adminDBResults[index].movie_id);
    //updateDB("delete", adminDBResults[index].movie_id, null, null, null, null, null, null, null);
  });

  $("#admin-search-results").on("click", ".admin-add-btn", function () {
    console.log("Add button is clicked");
    let currentRow = $(this).closest("tr");
    let index = $(this).val();
    let price = Number(currentRow.find(".admin-search-price").html());
    console.log(
      "Add Movie:" + adminSearchResults[index].movieID + ", " + price
    );

    // Change the button to say "Remove Movie" or "Add Movie"
    if ($(this).html() == "Add Movie") {
      $(this).html("Remove Movie");
      // ADD MOVIE TO DB HERE
    } else {
      $(this).html("Add Movie");
      // DELETE MOVIE FROM DB HERE
      //updateDB("delete", movieID);
    }

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
  });

  // WORK IN PROGRESS
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
    console.log(genre);
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
        console.log("updateDB:", status);
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
  /******************************************************************************
   *                           END Admin Page Code
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
    selectedMovieID = results[movieIndex].moveID; // set it as current selected movie
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
      console.log(movies[i]);
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
  $("add-movie").on("click", function (e) {
    let movieInfo = results[selectedMovieID];
    console.log("Movie Info:" + movieInfo);
    $.ajax({
      method: "get",
      url: "/updateCart",
      data: {
        action: "add",
        movie_info: movieInfo,
      },
      success: function (data, status) {
        console.log("Movie is added");
      },
    }); // end of ajax
  });
});
