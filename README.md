# bucket-brigade-volunteer-site
This project is created by the spring 2024 Computer Science Service Learning class at Santa Barbara High School's Computer Science Academy. It is created for Bucket Brigade in order to provide a website that educates and recruits high school students.

//in command line client

CREATE DATABASE posts;

USE posts;

CREATE TABLE submissions(id int NOT NULL AUTO_INCREMENT, name varchar(150) NOT NULL, grade int NOT NULL, school varchar(150), anonymous varchar(3) NOT NULL, date varchar(200) NOT NULL, work varchar(150) NOT NULL, story varchar(450), media varchar(1024), altText varchar(400), PRIMARY KEY(id));

CREATE TABLE approved(id int NOT NULL AUTO_INCREMENT, name varchar(150) NOT NULL, grade int NOT NULL, school varchar(150), anonymous varchar(3) NOT NULL, date varchar(200) NOT NULL, work varchar(150) NOT NULL, story varchar(450), media varchar(1024), altText varchar(400), PRIMARY KEY(id));

CREATE TABLE modEmails(id int NOT NULL AUTO_INCREMENT, email varchar(200), PRIMARY KEY(id));

CREATE USER 'bbuser'@'localhost'

->IDENTIFIED BY 'bbpassword';

GRANT ALL

->ON posts.*

->TO 'bbuser'@'localhost';

//if you get the error: Client does not support authentication protocol...

ALTER USER 'bbuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'bbpassword';

FLUSH PRIVILEGES;
