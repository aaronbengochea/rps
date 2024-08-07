DROP TABLE IF EXISTS users;

CREATE TABLE users(
    uid serial,
    fname varchar(40),
    lname varchar(40),
    state varchar(10),
    username varchar(20),
    pass varchar(20),
    email varchar(120),
    primary key (uid)
);