# Project Documentation

## Action Events

### Click “search” button
* Use AJAX call
* Route: "/search"
* Input Data: search_string (this variable will hold the string from the search text field)
* Return: selection.ejs is rendered, including JSON data.
* JSON Value: 
>`resultArray { title, imageUrl, rating, movieID, release_date, overview, genres }`

### Click “Register” button
* Use AJAX call
* Route: "/register"
* Input Data: firstName, lastName, username and password
* Return: sign-in.ejs is rendered 

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
* Return: sign-in.ejs is rendered

### Click “Sign In” using username and password
* Route: "/signIn"
* Return no Error: index.ejs is rendered
* Return with Error: sign-in.ejs is rendered with JSON data `{ loginError: true }`
* Note: Must use the POST method

### Main Page with Featured Movies
* Route: "/index"
* Return: index.ejs is rendered, including JSON data (the top 10 rated movies)
* JSON Value:
>`resultArray { title, imageUrl, rating, movieID, release_date, overview, genres }`

### Shopping Cart 
* Route: "/shoppingCart"
* Return: cart.ejs is rendered with JSON data
* JSON Value:
* Dan, can you fill this info in?

### Click “Logout” button
* Return: sign-in.ejs is rendered




