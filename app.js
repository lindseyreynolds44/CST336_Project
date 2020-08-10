require("dotenv").config(); // allows to run locally you need to use a .env file
const express = require("express");
const app = express();
const pool = require("./dbPool.js");
const homeController = require("./controllers/homeController");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true })); //to be able to parse POST parameters
const session = require("express-session");
const bcrypt = require("bcrypt");

app.use(
  session({
    secret: "top secret!",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(express.urlencoded({ extended: true })); //to be able to parse POST parameters

// Routes
// Root route for sign in page
app.get("/", homeController.displaySignInPage);

// Route to display main page of our website, once user is logged in
//app.get("/index", isAuthenticated, homeController.displayIndexPage);
app.get("/index", homeController.displayIndexPage); // for testing purpose

// When user clicks "sign in" on the sign in page, using
// their username and password (Be sure to use POST in .ejs file)
app.post("/signIn", async function (req, res) {
  let username = req.body.username;
  let password = req.body.password;

  // Check if this username and password exist in our database
  if (await verifyLoginInfo(req, username, password)) {
    res.redirect("/index");
  } else {
    //If username and password do not match, send back to sign in page
    res.render("sign-in", { loginError: true });
  }
});

// Display the new user registration page
app.get("/registrationPage", function (req, res) {
  res.render("register");
});

// Check if the username is available for use
app.get("/isUsernameAvailable", homeController.isUsernameAvailable);

// When user fills out form to create a new account and submits it
app.post("/createAccount", homeController.createAccount);

// Route for returning movies from a search
//app.get("/search", isAuthenticated, homeController.displaySearchResults);
app.get("/search", homeController.displaySearchResults); // for testing without authentication

// Route when user clicks the "logout" button
app.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/");
});

// Route when user adds or deletes movies from their cart
app.get("/updateCart", isAuthenticated, homeController.updateCart);

// Route to display the shopping cart page
app.get("/shoppingCart", isAuthenticated, homeController.displayCartPage);

// Display the admin page
//app.get("/adminPage", isAuthenticated, isAdmin, function (req, res) {
app.get("/adminPage", function (req, res) {
  //for testing
  res.render("admin");
});

// Called from ADMIN page in order to display a table of the movies from the DB
app.get("/api/getMoviesFromDB", homeController.getMoviesFromDB);

// Called from ADMIN page to add or delete from our DB
app.get("/api/updateDB", homeController.updateDB);

// Called from ADMIN page to retrieve the average movie price
app.get("/averagePrice", homeController.getAvgPrice);

// Called from ADMIN page to retrive the avrage movie rating
app.get("/averageRating", homeController.getAvgRating);

// Start server
app.listen(process.env.PORT, process.env.IP, function () {
  console.log("Express server is running...");
  console.log("Port:", process.env.PORT);
  console.log("IP:", process.env.IP);
  console.log("API_KEY:", process.env.API_KEY);
  console.log("HOST:", process.env.HOST);
  console.log("DB_USER:", process.env.DB_USER);
  console.log("DB_PASS:", process.env.DB_PASS);
  console.log("DB_NAME:", process.env.DB_NAME);
});

/*******************************************************************************
 *                           Authentication Functions                         *
 ******************************************************************************/

async function verifyLoginInfo(req, username, password) {
  let result = await checkUsername(username);
  let hashedPwd = "";

  if (result.length > 0) {
    hashedPwd = result[0].password;
  }

  let passwordMatch = await checkPassword(password, hashedPwd);

  if (passwordMatch) {
    req.session.authenticated = true;
    req.session.name = result[0].user_id;
    // 1 for admin, 0 for regular user
    req.session.admin = result[0].admin_privledges;
    return true;
  } else {
    return false;
  }
}

function checkUsername(username) {
  let sql = "SELECT * from user WHERE username = ?";
  return new Promise((resolve, reject) => {
    pool.query(sql, [username], (err, rows, fields) => {
      if (err) throw err;
      resolve(rows);
    }); // query
  }); // promise
}

function checkPassword(password, hashedValue) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hashedValue, (err, result) => {
      resolve(result);
    });
  });
}

function isAuthenticated(req, res, next) {
  if (!req.session.authenticated) {
    res.redirect("/");
  } else {
    next();
  }
}

function isAdmin(req, res, next) {
  if (!req.session.admin) {
    res.redirect("/index");
  } else {
    next();
  }
}
