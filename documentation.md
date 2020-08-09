# Project Documentation

## Action Events

### Check if a username is available

- Make an action event on the username text field

```
$("#new-username").on("change", function()
```

- Use AJAX call
- url: "/isUsernameAvailable"
- Input data: username
- Return: true or false

```
success: function(data, status){
    if(data.response) // add code here
}
```

### Click “add to cart” on a movie --Still may need to update this--

- Use AJAX call
- url: "/updateCart"
- Input Data: `movie_id, title, release_date, description, image_url, rating, genres and action: "add"`

### Click “remove from cart” --Still may need to update this--

- Use AJAX call
- url: "/updateCart"
- Input Data: `movie_id and action: "delete"`

## Routes

### Root route/Landing page

- Route: "/"
- Return: sign-in.ejs is rendered

### Click “Sign In” using username and password

- Route: "/signIn"

```
<form method="POST" action="/signIn">
```

- Input Data: Make input elements for username and password

```
<input type="text" name="username">
```

- Return no Error: index.ejs is rendered with JSON data for top 10 movies

```
resultArray[] { title, imageUrl, rating, movieID, release_date, overview, genres }
```

- Return with Error: sign-in.ejs is rendered again, but with JSON data `{ loginError: true }`

### Registration page

- Route: "/registrationPage"
- Return: register.ejs is rendered (this page will have 4 text boxes to fill
  in - username, password, first name and last name)

### Click "Create New Account" on Register Page

- Route: "/createAccount" (do this in the register.ejs file)
  `<form method="POST" action="/createAccount">`
- Input Data: Make input elements for username, password, firstName and lastName.
  `<input type="text" name="username">`
- Return: "confirmation.ejs" is rendered, with JSON data confirming their registration
  `userValues { username, firstName, lastName }`

### Main Page (index.ejs) with top Movies

- Route: "/index"
- Return: index.ejs is rendered, including JSON data (the top 10 rated movies)
- JSON Value:
  `resultArray[] { title, imageUrl, rating, movieID, release_date, overview, genres }`

### Click “search” button

- Route: "/search" (use a form element with action="/search")
  `<form action="/search">`
- Input Data: make an input element for the search using name="search_string"
  `<input type="text" name="search_string">`
- Return: selection.ejs is rendered, including JSON data.
- JSON Value:
  `resultArray[] { title, imageUrl, rating, movieID, release_date, overview, genres }`

### Click “Logout” button

- Route: "/logout"
- Return: sign-in.ejs is rendered

### Admin Page (This page is only accessible when logging in as admin - user: "admin" pass: "secret")

- Route: "/adminPage"
- Return: admin.ejs is rendered

### Shopping Cart --Still may need to update this--

- Route: "/shoppingCart"
- Return: cart.ejs is rendered with JSON data
- JSON Value: `cartContents[] {movie_id, title, image_url}`
- Example:

```
[
  RowDataPacket {
    movie_id: 120,
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    image_url: 'http://image.tmdb.org/t/p/w342/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg'
  },
  RowDataPacket {
    movie_id: 597,
    title: 'Titanic',
    image_url: 'http://image.tmdb.org/t/p/w342/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg'
  },
  RowDataPacket {
    movie_id: 496243,
    title: 'Parasite',
    image_url: 'http://image.tmdb.org/t/p/w342/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg'
  }
]

```
