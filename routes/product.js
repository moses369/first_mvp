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
      const { qty, useFor, user_id, ...product } = req.body;
      const { product_id } = product;

      if (
        !(await sql`SELECT * FROM products WHERE product_id = ${product_id}`)[0]
      ) {
        await sql` INSERT INTO products ${sql(product)}`;
      }

      let item;
      if (useFor === "fav_products") item = { user_id, product_id };
      if (useFor === "cart") item = { user_id, product_id, qty };
      if (
        !(await sql`SELECT * FROM ${sql(useFor)} WHERE product_id = ${product_id}`)[0]
      ) {
        const added = await sql`INSERT INTO ${sql(useFor)} ${sql(item)} RETURNING *`;
        res.status(201).json(added);
      }else{
        res.status(200).json({item:'Already Exist'})
      }
    } catch (error) {
      next(error);
    }
  });

products.route("/:id").delete(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { usedFor } = req.body;
    const ID = parseInt(id);
    if (isNaN(ID)) {
      next();
    } else {
      const item = await sql`SELECT * FROM ${sql(usedFor)} WHERE id = ${id}`;
      if (item) {
        const deleted =
          await sql`DELETE FROM ${sql(usedFor)} WHERE id = ${id} RETURNING *`;
        if (NODE_ENV !== "production") console.log("DELETED ", deleted[0], 'From:',usedFor);
        res.status(204).send("Item Deleted");
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
