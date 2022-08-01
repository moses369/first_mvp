import express from "express";
import dotenv from "dotenv";
import sql from "../database/db.js";
import sendReq from "../nodeFetch.js";

dotenv.config();
const { NODE_ENV } = process.env;

const products = express.Router();
products
  .route("/")
  .get(async (req, res, next) => {
    try {
      const data = await sendReq(req, next);
      res.json(data);
    } catch (err) {
      next(err);
    }
  })
  .post(async (req, res, next) => {
    try {     
      const { user_id,  ...product } = req.body;
      const { product_id } = product;
      const fav = { user_id, product_id };

      if (
        !(
          await sql`SELECT * FROM products WHERE product_id = ${product_id}`
        )[0]
      ) {
         await sql` INSERT INTO products ${sql(product)}`;
      }
      const favProd = await sql`INSERT INTO fav_products ${sql(fav)} RETURNING *`;
      res.status(201).json(favProd);
    } catch (error) {
      next(error);
    }
  });

products.route("/:id").delete(async (req, res, next) => {
  try {
    const { id } = req.params;
    const ID = parseInt(id);
    if (isNaN(ID)) {
      next();
    } else {
      const item = await sql`SELECT * FROM fav_products WHERE id = ${id}`;
      if (item) {
        const deleted =
          await sql`DELETE FROM fav_products WHERE id = ${id} RETURNING *`;
        if (NODE_ENV !== "production") console.log('DELETED ',deleted[0]);
        res.status(204).send("Item Unfavorited");
      } else {
        next();
      }
    }
  } catch (err) {
    next(err);
  }
});
products.use((req, res, next) => next());
export default products;
