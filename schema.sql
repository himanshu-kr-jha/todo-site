CREATE table user(
    id varchar(50) primary key,
    username varchar(30) not null,
    email varchar(30) not null,
    password varchar(30) not null
);

CREATE TABLE tasks (
    id VARCHAR(50) PRIMARY KEY,
    task VARCHAR(256) NOT NULL,
    time TIMESTAMP,
    status BOOLEAN,
    taskid varchar(50) unique
);