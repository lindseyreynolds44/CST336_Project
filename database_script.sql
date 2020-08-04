
-- Genre table to store genre information
CREATE TABLE genre (
genre_id		INT				NOT NULL,
genre_name 		VARCHAR(30)		NOT NULL,
CONSTRAINT genre_pk PRIMARY KEY (genre_id));

-- Movie table to store movies as users search the web API
CREATE TABLE movie (
movie_id		INT				NOT NULL 	  AUTO_INCREMENT,
title 			VARCHAR(100)	NOT NULL,
genre_id	  	INT				NOT NULL,
release_date 	VARCHAR(50)		NOT NULL, 
description 	VARCHAR(500)	NOT NULL,
image_url 		VARCHAR(100) 	NOT NULL,
CONSTRAINT movie_pk PRIMARY KEY (movie_id),
CONSTRAINT movie_fk_genre 
	FOREIGN KEY (genre_id) REFERENCES genre (genre_id));

-- User table to hold account information for each user
CREATE TABLE user (
user_id				INT				NOT NULL    AUTO_INCREMENT,
admin_privledges	BOOLEAN			NOT NULL,
username 			VARCHAR(50) 	NOT NULL,
password	 		VARCHAR(72) 	NOT NULL,
firstName 			VARCHAR(50) 	NOT NULL,
lastName 			VARCHAR(50) 	NOT NULL,		
CONSTRAINT user_pk PRIMARY KEY (user_id));
    
-- Cart table to store each users cart information
CREATE TABLE cart (
user_id			INT				NOT NULL,
movie_id 		INT				NOT NULL,
CONSTRAINT cart_pk PRIMARY KEY (user_id),
CONSTRAINT cart_fk_user 
	FOREIGN KEY (user_id) REFERENCES user (user_id),
CONSTRAINT cart_fk_movie 
	FOREIGN KEY (movie_id) REFERENCES movie (movie_id));
    
-- Insert genre records into genre table
INSERT INTO genre (genre_id, genre_name) VALUES 
(28, "Action"),
(12, "Adventure"),
(16, "Animation"),
(35, "Comedy"),
(80, "Crime"),
(99, "Documentary"),
(18, "Drama"),
(10751, "Family"),
(14, "Fantasy"),
(36, "History"),
(27, "Horror"),
(10402, "Music"),
(9648, "Mystery"),
(10749, "Romance"),
(878, "Science Fiction"),
(10770, "TV Movie"),
(53, "Thriller"),
(10752, "War"),
(37, "Western");

-- Insert admin users into user table
INSERT INTO user (admin_privledges, username, password, firstName, lastName) VALUES 
(true, "admin", "$2a$10$06ofFgXJ9wysAOzQh0D0..RcDp1w/urY3qhO6VuUJL2c6tzAJPfj6", "Helping", "Otters");


