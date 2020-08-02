require("dotenv").config(); // allows to run locally you need to use a .env file
const express = require("express");
const app = express();
const homeController = require("./controllers/homeController");
app.set("view engine", "ejs");
app.use(express.static("public"));

// Routes
// Root route for landing page
app.get("/", homeController.displayIndex);

// Route for shopping cart



// Start server
app.listen(process.env.PORT, process.env.IP, function () {
  console.log("Express server is running...");
  console.log("Port:", process.env.PORT);
  console.log("IP:", process.env.IP);
  console.log("API_KEY:", process.env.API_KEY);
});
