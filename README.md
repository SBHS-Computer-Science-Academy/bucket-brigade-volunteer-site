# bucket-brigade-volunteer-site
This project is created by the spring 2024 Computer Science Service Learning class at Santa Barbara High School's Computer Science Academy. It is created for Bucket Brigade in order to provide a website that educates and recruits high school students.

## Create database in DreamHost Server

Directions here: ://help.dreamhost.com/hc/en-us/articles/221691727-Creating-a-MySQL-database

Database name: posts

## Configure posts database in MySQL command line client

only run this if setting up locally; NOT on DreamHost:

CREATE DATABASE posts;

---------------------------------

run these commands on DreamHost and locally:

USE posts;

CREATE TABLE submissions(id int NOT NULL AUTO_INCREMENT, name varchar(150) NOT NULL, grade int NOT NULL, school varchar(150), anonymous varchar(3) NOT NULL, date varchar(200) NOT NULL, work varchar(150) NOT NULL, story varchar(450), status varchar(30) NOT NULL, PRIMARY KEY(id));


CREATE TABLE media(m_id int PRIMARY KEY NOT NULL AUTO_INCREMENT, path varchar(500) NOT NULL, altText varchar(400), id int, FOREIGN KEY (id) REFERENCES  submissions(id));


CREATE TABLE modEmails(id int NOT NULL AUTO_INCREMENT, email varchar(200), PRIMARY KEY(id));

CREATE USER 'bbuser'@'localhost' //Localhost is fine if there's only one server

->IDENTIFIED BY 'bbpassword'; //choose a secure password

GRANT ALL

->ON posts.*

->TO 'bbuser'@'localhost';

//if you get the error: Client does not support authentication protocol...

ALTER USER 'bbuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'bbpassword'; //use the same password as above

FLUSH PRIVILEGES;

Update the .env file with the secure password from above

## DIRECTIONS FOR INSTALLING REQUIRED PACKAGES

RUN THROUGH COMMAND PROMPT

npm install express ejs express-session passport passport-google-oauth --save

if there are any vulnerabilities, run fix command below until there are 0 vulnerabilities

npm audit fix

npm audit fix --force

repeat with:

npm install --save multer
npm install dotenv --save

npm install jquery

## UPDATING ENV FILE

Update the .env file with the new session secret and new google oauth secret
