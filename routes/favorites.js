import express from "express";
import dotenv from "dotenv";
import sql from "../database/db.js";

dotenv.config();
const { NODE_ENV } = process.env;
const devLog = (obj) => (NODE_ENV !== "production" ? console.log(obj) : null);

const favorites = express.Router();
/***************   ROUTES TO FAVORITES ***************/

favorites
  .route("/")
  .get(async (req, res, next) => {
    try {
      const { user_id } = req.headers;
      const items = await sql`SELECT 
     products.product_id, name, image,
     price, size, refrigerate, products.item,fav_products.id AS fav_id
   FROM fav_products
   RIGHT JOIN products
    ON fav_products.product_id = products.product_id
   WHERE 
      user_id = ${user_id}
   `;
      res.status(200).json(items);
    } catch (error) {
      next(error);
    }
  })
  .post(async (req, res, next) => {
    try {
      const { user_id, ...product } = req.body;
      const { product_id } = product;

      if (
        !(await sql`SELECT * FROM products WHERE product_id = ${product_id}`)[0]
      ) {
        await sql` INSERT INTO products ${sql(product)}`;
      }

      const item = { user_id, product_id };

      if (
        !(
          await sql`SELECT * FROM fav_products WHERE product_id = ${product_id}`
        )[0]
      ) {
        const added = await sql`INSERT INTO fav_products ${sql(
          item
        )} RETURNING *`;
        devLog({ useFor: "fav_products", added });
        res.status(201).json(added);
      } else {
        res.status(200).json({ item: "Already Exist" });
      }
    } catch (error) {
      next(error);
    }
  });
/***************  END ROUTES TO FAVORITES ***************/
favorites.use((req, res, next) => next());
export default favorites;