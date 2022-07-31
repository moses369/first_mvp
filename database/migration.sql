DROP TABLE IF EXISTS fav_products,users,orders,products;



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
CREATE TABLE products (
   product_id bigint NOT NULL PRIMARY KEY,
   name TEXT NOT NULL,
   categories TEXT NOT NULL,
   image TEXT NOT NULL,
   price MONEY NOT NULL,
   unit varchar(5) NOT NULL,
   size TEXT NOT NULL,
   refrigerate TEXT NOT NULL,
   fav_count INTEGER NOT NULL,
   order_count INTEGER NOT NULL
);
CREATE TABLE fav_products (
   id SERIAL,
   product_id INTEGER REFERENCES products(product_id),
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
