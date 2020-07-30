const express = require("express");
const app = express();
const homeController = require("./controllers/homeController");

app.set("view engine", "ejs");
app.use(express.static("public"));

// Routes
// Root route for landing page
app.get("/", homeController.displayIndex);

// Start server
app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Express server is running..."); 
});
