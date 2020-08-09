/* global $ */

var results;    // list of movies resulted from searching for the keywords
var featuredResults; // list of featured movies
var selectedMovieID; // current selected moive ID from the search

$(document).ready(function () {
  
  // Testing check user availability 
  // Display City from API after typing a zip code
  $("#new-username").on("change", function() {
    let user = $("#new-username").val();
    
    $.ajax({
        method: "GET",
        url: "/isUsernameAvailable",
        data: {  
          username: user
        },
        success: function(data, status) {
          
          $("#userError").html(`Is this username available? ${data.response}`);
        }
    }); //ajax
  }); //zip
  
  $("#home-form").on("submit", function(e) {
          
        if(!isFormValid()){
          e.preventDefault(); // not to reload the page
          // check the email
          $("#home-warning").css("color", "red");
          $("#home-warning").html("** Email address is required!");
          }
      });
    
     function isFormValid() {
        if ($("#home-text").val() == "")
        {
           return false;
        }
           return true;
 
     }

    /**
     * Index Page action event and functions
     */
    hideMovieDetail();  //hide the movie detail when the page is freshly loaded

    displayFeaturedMovies(featuredResults);  // display all the featured Movies

    function hideMovieDetail() {
        if ($("body").attr("page") == "index") { 
            $("#selected-movie-container").hide();
        }
    }

    // Request to search for movies using an AJAX call to server "/index" route
    // when keyword is entered
    $("#search-form").on("submit", function(e){
        e.preventDefault(); // not going to reload the page
        let keyword = $("#search-text").val().trim();
        console.log("search:" + keyword);
        if ( keyword == "" ) {
          $("#search-warning").css("color", "red");
          $("#search-warning").html("** Keyword is required!");
        }
        else {
          
            $.ajax({
            method: "get",
                url: "/search",
                data: {
                        "search_string": keyword
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
                }
            });//ajax
        }
    
    }); //index - keyword search

    // event for dynamically filled content   
    $("#resultsContainer").on("click", ".movie-poster", function() {
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

        $("#resultsContainer").append(htmlString);  // display all the found movie posters with release dates
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
                "action": "add",
                "movie_info": movieInfo

            },
            success: function (data, status) {
                console.log("Movie is added");
            }
        }); // end of ajax
    });

  
  
});
