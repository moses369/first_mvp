import express from "express";
import dotenv from "dotenv";
import sql from "../database/db.js";
import sendReq from "../nodeFetch.js";

dotenv.config();
const { NODE_ENV } = process.env;
const dev = () => NODE_ENV !== "production";
const products = express.Router();
/***************  ROUTES TO BASE URL ***************/
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
      const { fav_count, ordered, qty, useFor, user_id, ...product } = req.body;
      const { product_id } = product;

      if (
        !(await sql`SELECT * FROM products WHERE product_id = ${product_id}`)[0]
      ) {
        await sql` INSERT INTO products ${sql(product)}`;
      }
      let item;
      if (useFor === "fav_products") item = { user_id, product_id };
      if (useFor === "cart")
        item = { user_id, product_id, qty, date: Date.now() };
      if (
        !(
          await sql`SELECT * FROM ${sql(
            useFor
          )} WHERE product_id = ${product_id}`
        )[0]
      ) {
        const added = await sql`INSERT INTO ${sql(useFor)} ${sql(
          item
        )} RETURNING *`;
        if (dev()) console.log({ useFor, added });

        res.status(201).json(added);
      } else {
        res.status(200).json({ item: "Already Exist" });
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
        const deleted = await sql`DELETE FROM ${sql(
          usedFor
        )} WHERE id = ${id} RETURNING *`;
        if (dev()) console.log({ deleted: deleted[0], From: usedFor });
        res.status(204).send("Item Deleted");
      } else {
        next();
      }
    }
  } catch (err) {
    next(err);
  }
});
/***************  END ROUTES TO BASE URL ***************/
/***************   ROUTES TO FAVORITES ***************/

products.route("/favorites").get(async (req, res, next) => {
  try {
    const { user_id } = req.headers;
    const items = await sql`SELECT 
    products.product_id, name, image,
    price, size, refrigerate, item,fav_products.id AS fav_id
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
});
/***************  END ROUTES TO FAVORITES ***************/

/*************** ROUTE TO ITEM IN A TABLE ***************/
products
  .route("/table/:id")
  .get(async (req, res, next) => {
    try {
      const { user_id, usedfor } = req.headers;
      const { id } = req.params;
      const ID = parseInt(id);
      if (isNaN(ID)) {
        next();
      } else {
        const item = await sql`SELECT * FROM ${sql(
          usedfor
        )} WHERE product_id = ${id} AND user_id=${user_id}`;
        if (item) {
          res.status(200).json(item);
        } else {
          next();
        }
      }
    } catch (err) {
      next(err);
    }
  })
  .patch(async (req, res, next) => {
    try {
      const { id } = req.params;
      const { usedFor, user_id, ...update } = req.body;
      const ID = parseInt(id);
      if (isNaN(ID)) {
        next();
      } else {
        const item = await sql`SELECT * FROM ${sql(
          usedFor
        )} WHERE product_id = ${id} AND user_id=${user_id}`;
        if (item) {
          const updated = await sql`UPDATE ${sql(usedFor)} SET ${sql(
            update
          )}WHERE product_id = ${id} AND user_id=${user_id} RETURNING *`;
          if (dev()) console.log({ usedFor, updated });

          res.status(200).json(updated);
        } else {
          next();
        }
      }
    } catch (error) {
      next(error);
    }
  });
/*************** END ROUTE TO ITEM IN A TABLE ***************/
/***************  ROUTE TO ITEMS IN CART ***************/

products.route("/cart").get(async (req, res, next) => {
  try {
    const { user_id } = req.headers;
    const items = await sql`SELECT 
        products.product_id, name, image,
        price, size, refrigerate, item,cart.id AS order_id,qty
      FROM cart
      INNER JOIN products
      ON cart.product_id = products.product_id
      WHERE 
        user_id = ${user_id}
  `;
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
});
products.route("/cart/count").get(async (req, res, next) => {
  try {
    const { user_id } = req.headers;
    const items =
      await sql`SELECT COUNT(product_id) FROM cart  WHERE  user_id = ${user_id} `;
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
});
products.route("/cart/item").get(async (req, res, next) => {
  try {
    const { user_id } = req.headers;
    const items = await sql`SELECT item FROM products 
        LEFT JOIN cart 
          ON cart.product_id = products.product_id 
        WHERE user_id=${user_id}`;
    if (dev()) console.log({ retrieved: items });

    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
});
/*************** END ROUTE TO ITEMS IN CART ***************/
/***************  ROUTE TO LISTS ***************/
products
  .route("/lists")
  .get(async (req, res, next) => {
    try {
      const { user_id } = req.headers;
      const items = (
        await sql`SELECT items FROM lists WHERE user_id = ${user_id}`
      )[0];
      if (dev()) console.log({ retrieved: items });
      res.json(items);
    } catch (error) {
      next(error);
    }
  })
  .post(async (req, res, next) => {
    try {
      const { user_id } = req.body;

      if (!(await sql`SELECT * FROM lists WHERE user_id=${user_id}`)[0]) {
        const added = (
          await sql`INSERT INTO lists ${sql({ user_id })} RETURNING *`
        )[0];
        if (dev()) console.log({ added, table: "lists" });
        res.status(201).json(added);
      } else {
        res.status(200).json({ item: "Already added" });
      }
    } catch (error) {
      next(error);
    }
  })
  .patch(async (req, res, next) => {
    try {
      const { items, user_id, method } = req.body;
      let updated;
      switch (method) {
        case "update":
          updated = (
            await sql`UPDATE lists 
            SET  items = 
              CASE 
                WHEN items IS NULL THEN ${items}
                ELSE (SELECT items FROM lists) || ${items}
              END
              WHERE user_id = ${user_id} RETURNING *`
          )[0];
          break;
        case "delete":
          let oldItems = (
            await sql`SELECT items FROM  lists WHERE user_id = ${user_id} `
          )[0];
          oldItems = oldItems.items.split(",");
          oldItems.splice(oldItems.indexOf(items.split(" ,")[0]), 1);
          const newItems = oldItems.join(",");
          updated = (await sql`UPDATE lists SET items= ${newItems} WHERE user_id=${user_id} RETURNING *` )[0]
          break;
      }
      if (dev()) console.log({ table: "list", updated });
      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

/*************** END ROUTE TO LISTS ***************/

products.use((req, res, next) => next());
export default products;
