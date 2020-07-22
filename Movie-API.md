# The Movie Database API

## Method: GET /search/movie

### Description

Takes a string to return some details regarding a movie including the movie_ID. The search function returns a few fields. I don't think it is enough, but it does return the movie ID which we can use to call the other APIs.

### Test API String ( I stole the api key shhhh )

https://api.themoviedb.org/3/search/movie?api_key=2e9106137e566a1c862c47d7251bb5fe&language=en-US&query=titanic&page=1&include_adult=false

## Method GET /movie/{movie_id}

### Description:

Looks like this one just gives more primary information about the movie, but it's more detailed that the first.

### Test API String

https://api.themoviedb.org/3/movie/597?api_key=2e9106137e566a1c862c47d7251bb5fe&language=en-US

## Method GET /movie/{movie_id}/credits

### Description

This one will return the cast names, character names, and I believe an actor ID which we can use to display all movies a certain actor was in.

### Test API String

https://api.themoviedb.org/3/movie/597/credits?api_key=2e9106137e566a1c862c47d7251bb5fe

# Open Movie Database API (OMDb)

### Description

This one is simpler, but not as robust it also doesn't return multiple results when you search.

### Sample Result (copy and paste this to a JSON viewer of your choice)

{"Title":"Rush Hour","Year":"1998","Rated":"PG-13","Released":"18 Sep 1998","Runtime":"98 min","Genre":"Action, Comedy, Crime, Thriller","Director":"Brett Ratner","Writer":"Ross LaManna (story), Jim Kouf (screenplay), Ross LaManna (screenplay)","Actors":"Ken Leung, Jackie Chan, Tom Wilkinson, Tzi Ma","Plot":"Cultures clash and tempers flares as the two cops named Detective Inspector Lee a Hong Kong Detective and Detective James Carter FBI, a big-mouthed work-alone Los Angeles cop who are from different worlds discovers one thing in common: they can't stand each other. With time running out, they must join forces to catch the criminals and save the eleven-year-old Chinese girl of the Chinese consul named Soo Yung.","Language":"English, Cantonese, Mandarin","Country":"USA","Awards":"6 wins & 9 nominations.","Poster":"https://m.media-amazon.com/images/M/MV5BYWM2NDZmYmYtNzlmZC00M2MyLWJmOGUtMjhiYmQ2OGU1YTE1L2ltYWdlL2ltYWdlXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg","Ratings":[{"Source":"Internet Movie Database","Value":"7.0/10"},{"Source":"Rotten Tomatoes","Value":"60%"},{"Source":"Metacritic","Value":"60/100"}],"Metascore":"60","imdbRating":"7.0","imdbVotes":"232,877","imdbID":"tt0120812","Type":"movie","DVD":"02 Mar 1999","BoxOffice":"N/A","Production":"New Line Cinema","Website":"N/A","Response":"True"}
