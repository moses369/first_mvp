import express from "express";
import dotenv from "dotenv";
import sql from "../database/db.js";
dotenv.config();
const { NODE_ENV } = process.env;
const devLog = (obj) => (NODE_ENV !== "production" ? console.log(obj) : null);
const users = express.Router();

users
  .route("/")
  .post(async (req, res, next) => {
    try {
      const {name} = req.body
      const user_id = (await sql`SELECT id FROM users WHERE name = ${name}`)[0]
      if(user_id){
        res.json(user_id)
      }else{
        const newUser = (await sql`INSERT INTO users (name) VALUES (${name}) RETURNING *`)[0]
        devLog({newUser})
        res.sendStatus(201)
      }
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
