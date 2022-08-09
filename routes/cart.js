import express from "express";
import dotenv from "dotenv";
import sql from "../database/db.js";

dotenv.config();
const { NODE_ENV } = process.env;
const devLog = (obj) => (NODE_ENV !== "production" ? console.log(obj) : null);

const cart = express.Router();

/***************  ROUTE TO ITEMS IN CART ***************/
cart.route("/").get(async (req, res, next) => {
  try {
    const { user_id } = req.headers;
    const items = await sql`SELECT 
         products.product_id, name, image,
         price, size, refrigerate, products.item,cart_items.id AS cart_item_id,qty
       FROM cart_items
       INNER JOIN products
       ON cart_items.product_id = products.product_id
       WHERE 
         user_id = ${user_id}
   `;
    devLog({ retrieved: items, from: "cart_items" });
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
});

cart.route("/total").get(async (req, res, next) => {
  try {
    const { user_id } = req.headers;
    const { total_price } = (
      await sql` SELECT SUM(total_price) AS total_price  FROM cart_items WHERE user_id = ${user_id}`
    )[0];
    devLog({ total_price });
    res.json(total_price);
  } catch (error) {
    next(error);
  }
});
cart.route("/count").get(async (req, res, next) => {
  try {
    const { user_id } = req.headers;
    const { count } = (
      await sql`SELECT COUNT(product_id) FROM cart_items  WHERE  user_id = ${user_id} `
    )[0];
    devLog({ count });
    res.status(200).json(count);
  } catch (error) {
    next(error);
  }
});
cart
  .route("/item")
  .get(async (req, res, next) => {
    try {
      const { user_id } = req.headers;
      const items = await sql`
        SELECT products.item 
         FROM products 
         LEFT JOIN cart_items 
           ON cart_items.product_id = products.product_id 
         WHERE user_id=${user_id}
       `;
      devLog({ retrieved: items });

      res.status(200).json(items);
    } catch (error) {
      next(error);
    }
  })
  .post(async (req, res, next) => {
    try {
      const { qty, total_price, fav_count, user_id, ...product } = req.body;
      const { product_id } = product;

      if (
        !(await sql`SELECT * FROM products WHERE product_id = ${product_id}`)[0]
      ) {
        await sql` INSERT INTO products ${sql(product)}`;
      }
      const item = {
        user_id,
        product_id,
        qty,
        item: product.item,
        date: Date.now(),
        total_price,
      };

      if (
        !(
          await sql`SELECT * FROM cart_items WHERE product_id = ${product_id}`
        )[0]
      ) {
        const added = await sql`INSERT INTO cart_items ${sql(
          item
        )} RETURNING *`;
        devLog({ useFor: "cart_items", added });

        res.status(201).json(added);
      } else {
        res.status(200).json({ item: "Already Exist" });
      }
    } catch (error) {
      next(error);
    }
  })
  .delete(async (req, res, next) => {
    try {
      const { item, user_id } = req.body;
      const deleted =
        await sql`DELETE FROM cart_items WHERE item=${item} AND user_id=${user_id} RETURNING *`;
      devLog({ deleted, from: "cart_items" });
      res.status(200).json(deleted);
    } catch (error) {
      next(error);
    }
  });
/*************** END ROUTE TO ITEMS IN CART ***************/
cart.use((req, res, next) => next());
export default cart;
