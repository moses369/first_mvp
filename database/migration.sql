DROP TABLE IF EXISTS products,users,orders;

CREATE TABLE products (
   id SERIAL PRIMARY KEY,
   name TEXT NOT NULL,
   image TEXT NOT NULL,
   price MONEY NOT NULL,
   per_lb BOOLEAN NOT NULL
);

INSERT INTO products 
   (name, image, price,per_lb) VALUES
   ('Garlic', 'https://bivianodirect.com.au/wp-content/uploads/2020/06/products-531BBAF5-1614-4259-A3AE-7B56A181F178.jpg', 1.25,true),
   ('Onion', 'https://www.petpoisonhelpline.com/wp-content/uploads/2011/10/Onion.jpg', 1.50,true),
   ('Flanken Style Ribs', 'https://i5.walmartimages.com/asr/5019dd47-b8d5-45a7-b7df-f67c65dc383c_12.2d9e1464ee4dbf5c42d7b5f4fa6cf10d.png', 10.00,false),
   ('Roasted Red Pepper Hummus','https://i5.walmartimages.com/asr/7f14eb3e-860f-457c-9668-86e0d87fa4fd_3.dfb9b6b35ae77e10377248edd9c8c077.png',3.50,false),
   ('Jasmin Rice','https://i5.walmartimages.com/asr/30b8ed89-7ec8-470b-bb6e-607b4989f66f_2.6f9761b421e963d869616598cb2b039e.jpeg',5.00,false);

CREATE TABLE users (
   id SERIAL PRIMARY KEY,
   name TEXT NOT NULL,
   email TEXT NOT NULL,
   phone character(10),
   address TEXT NOT NULL
);

INSERT INTO users 
   (name, email,phone, address) VALUES
   ('Moses', 'moses@email.com', null,'8th st. WhereYouAt' ),
   ('Paul', 'paul@email.com', 3334456789,'9th st. OverHere' ),
   ('Martha', 'martha@email.com', null,'10th st. WhereWeGoing' ),
   ('Alex', 'alex@email.com', 9890977890,'11th st. IKnowWhere' ),
   ('Micheal', 'micheal@email.com', null,'12th st. ToAtlantis' );

CREATE TABLE orders (
   id serial,
   user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
   product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT,
   date TIMESTAMP
);

INSERT INTO orders
   (user_id, product_id, date) VALUES
   (1,4,'now'),
   (1,5,'now'),
   (2,1,'now'),
   (2,2,'now'),
   (3,3,'now'),
   (4,4,'now');
