import express from "express";
import dotenv from "dotenv";
import sql from "../database/db.js";

dotenv.config();
const { NODE_ENV } = process.env;
const devLog = (obj) => (NODE_ENV !== "production" ? console.log(obj) : null);

const lists = express.Router();
/***************  ROUTE TO LISTS ***************/
lists
  .route("/")
  .get(async (req, res, next) => {
    try {
      const { user_id } = req.headers;
      const items = (
        await sql`SELECT items FROM lists WHERE user_id = ${user_id}`
      )[0];
      devLog({ retrieved: items });
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
        devLog({ page: "refreshed", added, table: "lists" });
        res.status(201).json(added);
      } else {
        devLog({ page: "refreshed", user_id, already: "on list" });
        res.status(200).json({ item: "already added" });
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
          res.json(updated);
          break;
        case "delete":
          let oldItems = (
            await sql`SELECT items FROM  lists WHERE user_id = ${user_id} `
          )[0];
          oldItems = oldItems.items.split(",");
          oldItems.splice(oldItems.indexOf(items.split(",")[0]), 1);
          const newItems = oldItems.join(",");
          updated = (
            await sql`UPDATE lists SET items= ${newItems} WHERE user_id=${user_id} RETURNING *`
          )[0];
          res.sendStatus(204);
          break;
      }
      devLog({ table: "list", method, items, updated });
    } catch (error) {
      next(error);
    }
  });

/*************** END ROUTE TO LISTS ***************/
lists.use((req, res, next) => next());
export default lists;
