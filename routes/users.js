import express from "express";
import dotenv from "dotenv";
import sql from "../database/db.js";
dotenv.config();
const { API_TOKEN } = process.env;
const users = express.Router();

users
  .route("/")
  .post(async (req, res, next) => {
    try {
    } catch (err) {
      next(err);
    }
  })
  .get(async (req, res, next) => {
    try {
      res.json(await sql`SELECT * FROM users`);
    } catch (err) {
      next(err);
    }
  });

users.route("/:id").get(async (req, res, next) => {
  try {
    let { id } = req.params;
    id = parseInt(id);
    if (!isNaN(id)) {
      const user = (await sql`SELECT * FROM users WHERE id = ${id}`)[0];
      if (user) {
        res.json(user);
      }else{
         next()
      }
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
});
export default users;
