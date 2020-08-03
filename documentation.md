# Project Documentation

## Action Events

### Click “search” button
* Use AJAX call
* Route: "/search"
* Return: resultPage.ejs is rendered, including JSON data.
* JSON Value: 
>`resultArray { title, imageUrl, rating, movieID, release_date, overview, genres }`

### Click “Create new account” button
* Use AJAX call
* Route: "/createAccount"
* Input Data: firstName, lastName, username and password
* Return: loginPage.ejs is rendered

### Click “Logout” button
* Return: loginPage.ejs is rendered

### Click “add to cart” on a movie
* Use AJAX call
* Route: "/updateCart"
* Input Data: movie_id and action: "add"

### Click “remove from cart”
* Use AJAX call
* Route: "/updateCart"
* Input Data: movie_id and action: "delete"


## Routes 

### Root route/Landing page
* Route: "/"
* Return: loginPage.ejs is rendered

### Click “Login” using username and password
* Route: "/login"
* Return: welcome.ejs is rendered 
* Note: Must use the POST method

### Main Page with Featured Movies
* Route: "/welcome"
* Return: welcome.ejs is rendered

### Shopping Cart 
* Dan, can you fill in this one?




