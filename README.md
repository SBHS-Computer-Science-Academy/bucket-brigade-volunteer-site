# bucket-brigade-volunteer-site
This project is created by the spring 2024 Computer Science Service Learning class at Santa Barbara High School's Computer Science Academy. It is created for Bucket Brigade in order to provide a website that educates and recruits high school students.

CREATE DATABASE posts;
USE posts;
CREATE TABLE submissions(
->id int NOT NULL AUTO_INCREMENT,
->name varchar(150) NOT NULL,
->grade int NOT NULL,
->school varchar(150),
->anonymous varchar(3) NOT NULL,
->date varchar(200) NOT NULL,
->work varchar(150) NOT NULL,
->story varchar(450),
->media varchar(1024),
->altText varchar(400),
->PRIMARY KEY(id)
->);
CREATE TABLE approved(
->id int NOT NULL AUTO_INCREMENT,
->name varchar(150) NOT NULL,
->grade int NOT NULL,
->school varchar(150),
->anonymous varchar(3) NOT NULL,
->date varchar(200) NOT NULL,
->work varchar(150) NOT NULL,
->story varchar(450),
->media varchar(1024),
->altText varchar(400),
->PRIMARY KEY(id)
->);
CREATE TABLE modEmails(
->id int NOT NULL AUTO_INCREMENT,
->email varchar(200)
->PRIMARY KEY(id)
->);
