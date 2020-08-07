

-- Movie table to store movies as users search the web API
CREATE TABLE movie (
movie_id		INT				NOT NULL,
title 			VARCHAR(100)	NOT NULL,
release_date 	VARCHAR(50)		NOT NULL, 
description 	VARCHAR(800)	NOT NULL,
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
(true, "admin", "$2a$10$06ofFgXJ9wysAOzQh0D0..RcDp1w/urY3qhO6VuUJL2c6tzAJPfj6", 
"Helping", "Otters");


-- Insert movies into movie table
INSERT INTO movie (movie_id, title, release_date, description, image_url, rating) VALUES 
(75780, "Jack Reacher", "12/20/2012", 
'When a gunman takes five lives with six shots, all evidence points to the suspect in 
custody. On interrogation, the suspect offers up a single note: "Get Jack Reacher!" 
So begins an extraordinary chase for the truth, pitting Jack Reacher against an 
unexpected enemy, with a skill for violence and a secret to keep',
'http://image.tmdb.org/t/p/w342/zlyhKMi2aLk25nOHnNm43MpZMtQ.jpg',
6.5),
(597, "Titanic", "11/18/1997", 
"101-year-old Rose DeWitt Bukater tells the story of her life aboard the Titanic, 
84 years later. A young Rose boards the ship with her mother and fiancé. Meanwhile, 
Jack Dawson and Fabrizio De Rossi win third-class tickets aboard the ship. Rose 
tells the whole story from Titanic's departure through to its death—on its first 
and last voyage—on April 15, 1912.",
'http://image.tmdb.org/t/p/w342/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg',
7.8),
(11688, "The Emperor's New Groove", "12/9/2000", 
"Kuzco is a self-centered emperor who summons Pacha from a village and to tell 
him that his home will be destroyed to make room for Kuzco's new summer home. 
Kuzco's advisor, Yzma, tries to poison Kuzco and accidentally turns him into a 
llama, who accidentally ends up in Pacha's village. Pacha offers to help Kuzco 
if he doesn't destroy his house, and so they form an unlikely partnership.",
'http://image.tmdb.org/t/p/w342/6c4dzX5Io2i9tP30ZRnrhwjsYt7.jpg',
7.5),
(120, "The Lord of the Rings: The Fellowship of the Ring", "12/18/2001", 
'Young hobbit Frodo Baggins, after inheriting a mysterious ring from his 
uncle Bilbo, must leave his home in order to keep it from falling into the 
hands of its evil creator. Along the way, a fellowship is formed to protect 
the ringbearer and make sure that the ring arrives at its final destination: 
Mt. Doom, the only place where it can be destroyed.',
'http://image.tmdb.org/t/p/w342/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg',
8.3),
(27205, "Inception", "7/15/2010", 
"Cobb, a skilled thief who commits corporate espionage by infiltrating the 
subconscious of his targets is offered a chance to regain his old life as 
payment for a task considered to be impossible: inception, the implantation 
of another person's idea into a target's subconscious.",
'http://image.tmdb.org/t/p/w342/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
8.3),
(155, "The Dark Knight", "7/16/2008", 
'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon 
and District Attorney Harvey Dent, Batman sets out to dismantle the remaining 
criminal organizations that plague the streets. The partnership proves to be 
effective, but they soon find themselves prey to a reign of chaos unleashed 
by a rising criminal mastermind known to the terrified citizens of Gotham 
as the Joker.',
'http://image.tmdb.org/t/p/w342/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
8.4),
(496243, "Parasite", "5/30/2019", 
"All unemployed, Ki-taek's family takes peculiar interest in the wealthy and 
glamorous Parks for their livelihood until they get entangled in an 
unexpected incident.",
'http://image.tmdb.org/t/p/w342/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
8.5),
(278, "The Shawshank Redemption", "9/23/1994", 
'Framed in the 1940s for the double murder of his wife and her lover, 
upstanding banker Andy Dufresne begins a new life at the Shawshank prison, 
where he puts his accounting skills to work for an amoral warden. During 
his long stretch in prison, Dufresne comes to be admired by the other 
inmates -- including an older prisoner named Red -- for his integrity 
and unquenchable sense of hope.',
'http://image.tmdb.org/t/p/w342/5KCVkau1HEl7ZzfPsKAPM0sMiKc.jpg',
8.7),
(275, "Fargo", "3/8/1996", 
"Jerry, a small-town Minnesota car salesman is bursting at the seams with 
debt... but he's got a plan. He's going to hire two thugs to kidnap his 
wife in a scheme to collect a hefty ransom from his wealthy father-in-law. 
It's going to be a snap and nobody's going to get hurt... until people 
start dying. Enter Police Chief Marge, a coffee-drinking, parka-wearing 
- and extremely pregnant - investigator who'll stop at nothing to get her 
man. And if you think her small-time investigative skills will give 
the crooks a run for their ransom... you betcha!",
'http://image.tmdb.org/t/p/w342/kKpORM0G7xDvJGQiXpQ0wUp9Dwo.jpg',
7.9),
(76341, "Mad Max: Fury Road", "5/13/2015", 
'An apocalyptic story set in the furthest reaches of our planet, in a stark 
desert landscape where humanity is broken, and most everyone is crazed 
fighting for the necessities of life. Within this world exist two rebels 
on the run who just might be able to restore order.',
'http://image.tmdb.org/t/p/w342/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg',
7.5);

-- Insert the associated genre records for the previous movies
INSERT INTO genre (genre_id, movie_id, genre_name) VALUES 
(80, 75780, 'Crime'),
(18, 75780, 'Drama'),
(53, 75780, 'Thriller'),
(28, 75780, 'Action'),
(18, 597, 'Drama'),
(10749, 597, 'Romance'),
(12, 11688, "Adventure"),
(16, 11688, "Animation"),
(35, 11688, "Comedy"),
(14, 11688, "Fantasy"),
(10751, 11688, "Family"),
(28, 120, "Action"),
(12, 120, "Adventure"),
(14, 120, "Fantasy"),
(28, 27205, "Action"),
(12, 27205, "Adventure"),
(878, 27205, "Science Fiction"),
(28, 155, 'Action'),
(80, 155, 'Crime'),
(18, 155, 'Drama'),
(53, 155, 'Thriller'),
(35, 496243, "Comedy"),
(18, 496243, 'Drama'),
(53, 496243, 'Thriller'),
(80, 278, 'Crime'),
(18, 278, 'Drama'),
(80, 275, 'Crime'),
(18, 275, 'Drama'),
(53, 275, 'Thriller'),
(28, 76341, "Action"),
(12, 76341, "Adventure"),
(878, 76341, "Science Fiction");

-- (28, "Action"),
-- (12, "Adventure"),
-- (16, "Animation"),
-- (35, "Comedy"),
-- (80, "Crime"),
-- (99, "Documentary"),
-- (18, "Drama"),
-- (10751, "Family"),
-- (14, "Fantasy"),
-- (36, "History"),
-- (27, "Horror"),
-- (10402, "Music"),
-- (9648, "Mystery"),
-- (10749, "Romance"),
-- (878, "Science Fiction"),
-- (10770, "TV Movie"),
-- (53, "Thriller"),
-- (10752, "War"),
-- (37, "Western");


