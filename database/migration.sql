DROP TABLE IF EXISTS fav_products,users,orders,products,cart,lists,cart_items;



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
   product_id character(13) NOT NULL PRIMARY KEY,
   name TEXT NOT NULL,
   image TEXT NOT NULL,
   price NUMERIC(10,2) NOT NULL,
   size TEXT NOT NULL,
   refrigerate TEXT NOT NULL,
   item TEXT NOT NULL,
   order_count INTEGER NOT NULL
);
CREATE TABLE fav_products (
   id SERIAL,
   product_id character(13) REFERENCES products(product_id),
   user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE cart_items (
   id SERIAL,
   product_id character(13) REFERENCES products(product_id),
   user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
   item TEXT NOT NULL,
   qty INTEGER NOT NULL,
   total_price NUMERIC(10,2) NOT NULL,
   date TIMESTAMP NOT NULL
);
CREATE TABLE orders (
   id SERIAL,
   product_id character(13) REFERENCES products(product_id),
   user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
   qty INTEGER NOT NULL,
   ordered TEXT NOT NULL,
   date TIMESTAMP NOT NULL
);

CREATE TABLE lists (
   id SERIAL PRIMARY KEY,
   user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
   items TEXT 
);


-- INSERT INTO orders
--    (user_id, product_id, date) VALUES
--    (1,4,'now'),
--    (1,5,'now');
