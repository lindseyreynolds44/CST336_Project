require("dotenv").config(); // allows to run locally you need to use a .env file
const express = require("express");
const app = express();
const homeController = require("./controllers/homeController");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true })); //to be able to parse POST parameters
const session = require("express-session");
const bcrypt = require("bcrypt");

// Routes
// Root route for login page
app.get("/", homeController.displayLoginPage);

// Route to display main page of our website, once user is logged in
app.get("/welcome", function(req, res){
    res.render("welcome"); 
});

// When user clicks "login" on the login page, using
// their username and password (Be sure to use POST in .ejs file)
app.post("/login", homeController.login);

// When user fills out form to create a new account and submits it
app.post("/createAccount", homeController.createAccount);

// Route for returning movies from a search
app.get("/search", homeController.displaySearchResults);

// Route when user clicks the "logout" button
app.get("/logout", homeController.logout);

// Route when user adds or deletes movies from their cart
app.get("/updateCart", homeController.updateCart);

// Route to display the shopping cart page 
app.get("/shoppingCart", homeController.displayCartPage);





// Start server
app.listen(process.env.PORT, process.env.IP, function () {
  console.log("Express server is running...");
  console.log("Port:", process.env.PORT);
  console.log("IP:", process.env.IP);
  console.log("API_KEY:", process.env.API_KEY);
});
