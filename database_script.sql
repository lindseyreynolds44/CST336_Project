

-- Movie table to store movies as users search the web API
CREATE TABLE movie (
movie_id		INT				NOT NULL 	  AUTO_INCREMENT,
title 			VARCHAR(100)	NOT NULL,
release_date 	VARCHAR(50)		NOT NULL, 
description 	VARCHAR(500)	NOT NULL,
image_url 		VARCHAR(100) 	NOT NULL,
rating			VARCHAR(30)		NOT NULL,
CONSTRAINT movie_pk PRIMARY KEY (movie_id));

-- Genre table to store genre information for each movie
CREATE TABLE genre (
genre_id		INT				NOT NULL,
movie_id		INT				NOT NULL,
genre_name 		VARCHAR(30)		NOT NULL,
CONSTRAINT genre_pk PRIMARY KEY (genre_id, movie_id),
CONSTRAINT genre_fk_movie 
	FOREIGN KEY (movie_id) REFERENCES movie (movie_id));

-- User table to hold account information for each user
CREATE TABLE user (
user_id				INT				NOT NULL    AUTO_INCREMENT,
admin_privledges	INT 			NOT NULL,
username 			VARCHAR(50) 	NOT NULL,
password	 		VARCHAR(72) 	NOT NULL,
firstName 			VARCHAR(50) 	NOT NULL,
lastName 			VARCHAR(50) 	NOT NULL,		
CONSTRAINT user_pk PRIMARY KEY (user_id));
    
-- Cart table to store each users cart information
CREATE TABLE cart (
user_id			INT				NOT NULL,
movie_id 		INT				NOT NULL,
CONSTRAINT cart_pk PRIMARY KEY (user_id, movie_id),
CONSTRAINT cart_fk_user 
	FOREIGN KEY (user_id) REFERENCES user (user_id),
CONSTRAINT cart_fk_movie 
	FOREIGN KEY (movie_id) REFERENCES movie (movie_id));
    

-- Insert admin users into user table
INSERT INTO user (admin_privledges, username, password, firstName, lastName) VALUES 
(true, "admin", "$2a$10$06ofFgXJ9wysAOzQh0D0..RcDp1w/urY3qhO6VuUJL2c6tzAJPfj6", "Helping", "Otters");


