DROP TABLE IF EXISTS fav_products,users,orders;



CREATE TABLE users (
   id SERIAL PRIMARY KEY,
   name TEXT NOT NULL,
   email TEXT NOT NULL,
   phone character(10),
   address TEXT 
);
INSERT INTO users 
   (name, email,phone, address) VALUES
   ('Moses', 'moses@email.com', null,'8th st. WhereYouAt' );

CREATE TABLE fav_products (
   id SERIAL,
   actual_prod_id bigint NOT NULL,
   name TEXT NOT NULL,
   categories TEXT NOT NULL,
   image TEXT NOT NULL,
   price MONEY NOT NULL,
   unit varchar(5) NOT NULL,
   size TEXT NOT NULL,
   refrigerate TEXT NOT NULL,
   fav TEXT NOT NULL,
   user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);




CREATE TABLE orders (
   id serial,
   user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
   product_id BIGINT NOT NULL,
   date DATE
);

-- INSERT INTO orders
--    (user_id, product_id, date) VALUES
--    (1,4,'now'),
--    (1,5,'now');
