DROP DATABASE IF EXISTS catchernet;
CREATE DATABASE catchernet;

\c catchernet;

CREATE TABLE neighbour (
   id SERIAL PRIMARY KEY,
   name VARCHAR,
   email VARCHAR,
   phone CHAR(15),
   address VARCHAR,
   postcode CHAR(8)
);
