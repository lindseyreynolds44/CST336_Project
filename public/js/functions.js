/* global $ */
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
  
});
