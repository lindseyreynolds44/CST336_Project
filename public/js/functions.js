/* global $ */
var originalResults; // original movie list without any filtering
var featuredResults; // list of featured movies
var selectedMovieID; // current selected moive ID
var selectedMovieIndex; // reference index to the featuredResults 
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
          html += `<td> <button id="admin-update-btn" class="btn btn-info" value=${i}>Update</button> </td>`;
          html += `<td> <button id="admin-delete-btn" class="btn btn-info" value=${i}>Delete</button> </td>`;
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
            html += `<td> <button id='admin-add-btn' class='btn btn-info' value=${i}>Add Movie</button> </td>`;
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

  displayFeaturedMovies(originalResults); // display all the movies in the results

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
          originalResults = data; // store the original search results
          featuredResults = data; // featured results is same as original before filtering
          

          // display all the movie posters in the results
          $("#featured-header").html(""); // remove the featured header
          displayAllMovies(featuredResults);
          displayGenreOptions(featuredResults);  // display new set of genre option
          $("#filter-rating option:first").prop("selected", true); // reset the rating option too
          
          $("#selected-movie-container").hide(); // remove the last selected movie detail
          
          // following 3 lines are comment out - not showing detail after the search
          // display the first movie image and detail from the list
          //$("#selected-movie-container").show();
          //displayMovieImageAndDetail(0);
        },
      }); //ajax
    }
  }); //index - keyword search
  
  // reset filters
  $("#reset-filters").on("click", function() {
    
    $("#filter-genre option:first").prop("selected", true);
    $("#filter-rating option:first").prop("selected", true);
    
    // reset back to original list of movies, and remove the selected movie as well
    $("#selected-movie-container").hide(); 
    featuredResults = originalResults;
    displayAllMovies(featuredResults);
  });

  // genre option is selected
  $("#filter-genre").on("change", function () {
    
    displayFilteredMovies();
   
  });

  // a rating is selected
  $("#filter-rating").on("change", function () {
      displayFilteredMovies();
      
      //$("#filter-rating option:first").prop("selected", true);
    
  });
  
  // display and filter the original list of movies
  function displayFilteredMovies() {
    
    featuredResults = originalResults; // reset to original list before filtering
    
    // filter the movies with current selected genre
    let genre = $("#filter-genre").children("option:selected").val();
    console.log("Option is clicked:", genre);
    if (genre != "") {
      featuredResults = filterMovieByGenre(featuredResults, genre);
      console.log("Genre filtered", featuredResults);
      
    }
     
    // filter the movie with current selected rating
    let rating = $("#filter-rating").children("option:selected").val();
    console.log("Rating is clicked:", rating);
    if (rating != "") {
        featuredResults = filterMovieByRating(featuredResults, rating);
        console.log("Rating filtered", featuredResults);
    }

    $("#selected-movie-container").hide(); // remove the last selected movie detail
    displayAllMovies(featuredResults);
    //displayGenreOptions(featuredResults);
  }

  // event for dynamically filled content
  $("#resultsContainer").on("click", ".movie-poster", function () {
    console.log("A movie is clicked");
    selectedMovieIndex = Number($(this).attr("value"));
    console.log(" Selected Movie Index:" + selectedMovieIndex);
    
    displayMovieImageAndDetail(selectedMovieIndex);
    $("#selected-movie-container").show();
    selectedMovieID = featuredResults[selectedMovieIndex].movieID; // set it as current selected movie
    console.log("SELECTED MOVIE ID", selectedMovieID);
    window.scrollTo(0, 0); // scroll back to the top
  });

  // display featured movies
  function displayFeaturedMovies(movies) {
    if ($("body").attr("page") == "index") {
      $("#featured-header").html("Recommended Movies");
      displayAllMovies(movies);
      displayGenreOptions(movies);  // display a new set of genre options
      $("#filter-rating option:first").prop("selected", true); // reset the rating option too
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
      if (imgPath.search("w342null") >= 0) {
        // no poster image for the movie
        htmlString += `<div class='movie-poster' style='background-image:url(../img/filmstrip.png);' value=${i}>${movies[i].title}</div>`;
      } else {
        htmlString += `<div class='movie-poster' style='background-image:url(${imgPath});' value=${i}></div>`;
        //htmlString += `<img class='movie-poster' src='${imgPath}' alt='${movies[i].title}' width='200' height='300' value=${i}>`;
      }
      // htmlString += `<br> ${movies[i].release_date}`;
      htmlString += "</div>";
    }

    $("#resultsContainer").append(htmlString); // display all the found movie posters with release dates
  }

  // display the poster image of the movie with given index
  function displayMovieImageAndDetail(index) {
    console.log("index and length", index, featuredResults.length);
    let imgPath = featuredResults[index].imageUrl;
    if (index < featuredResults.length) {
      
      if (imgPath.search("w342null") >= 0) {
        // there are no image poster, so replace with default image
        imgPath = "../img/movie_poster.jpg";
      }
      let htmlString = `<img class='movie-image' src='${imgPath}' alt='${featuredResults[index].title}' width='400' height='600' value=${index}>`;
      $("#selected-image").html(htmlString);
      $("#title").html(featuredResults[index].title);
      $("#synopsis-content").html(featuredResults[index].overview);
      $("#rating-content").html(featuredResults[index].rating);
      $("#release-content").html(featuredResults[index].release_date);
      // display the list of genres the movie belongs to
      let genreString = "";
      featuredResults[index].genres.forEach((name, i) => {
        console.log("Genre: ", name);
        if (i != 0) genreString += ", ";
        genreString += name;
        
      });
      $("#genre-content").html(genreString);
      $("#price-content").html(featuredResults[index].price);
      $("#add-movie").html("Add to the Cart");
      $("#add-movie").prop('disabled', false);
      
    } else {
      $("#selected-movie-container").hide();
    }
  }

  // event handler when "Add to Cart" button is clicked
  $("#add-movie").on("click", function (e) {
    console.log("added to cart", selectedMovieIndex);
    console.log(featuredResults[3]);
    
    $.ajax({
      method: "get",
      url: "/updateCart",
      data: {
        action: "add",
        movie_id: featuredResults[selectedMovieIndex].movieID,
        title: featuredResults[selectedMovieIndex].title,
        release_date: featuredResults[selectedMovieIndex].release_date,
        description: featuredResults[selectedMovieIndex].overview,
        image_url: featuredResults[selectedMovieIndex].imageUrl,
        rating: featuredResults[selectedMovieIndex].rating,
        genres: featuredResults[selectedMovieIndex].genres,
        price: featuredResults[selectedMovieIndex].price
      },
      success: function (data, status) {
        console.log("Movie is added");
        $("#add-movie").html("Movie is Added to Cart");
        $("#add-movie").prop('disabled', true);
      },
    }); // end of ajax
  });

  // display genre option list
  function displayGenreOptions(movies) {
    // create available genre options
    let genreOptions = [];
    movies.forEach((movie) => {
      movie.genres.forEach((name) => {
        if (!genreOptions.includes(name)) {
          genreOptions.push(name);
        }
      });
    });
    // sort the options list
    let sortedGenreOptions = genreOptions.sort((a, b) => {
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      return 0;
    });
    console.log("Sorted Genre Options", sortedGenreOptions);

    let html = "<option value=''>Select One </option>";
    sortedGenreOptions.forEach((name) => {
      html += `<option>${name}</option>`;
    });
    //console.log("genrehtml", html);
    $("#filter-genre").html(html);
  }

  // filter the movie list by genre
  function filterMovieByGenre(movieList, genre) {
    let filteredMovies = movieList.filter((movie) => {
      return movie.genres.includes(genre);
    });
    console.log(filteredMovies);
    return filteredMovies;
  }

  // filter the movie list by rating
  function filterMovieByRating(movieList, minRating) {
    let filteredMovies = movieList.filter((movie) => {
      return Number(movie.rating) >= Number(minRating);
    });
    console.log(filteredMovies);
    return filteredMovies;
  }
});
