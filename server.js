import sql from "./database/db.js";
import express from "express";
import dotenv from "dotenv";
import products from './routes/product.js'
import users from './routes/users.js'
import cors from 'cors'

dotenv.config();
const app = express();
const { PORT, API_TOKEN } = process.env;



const sendPost = async (req, res, next, table) => {
  try {
    const added = (
      await sql` 
     INSERT INTO ${sql(`${table}`)} ${sql(req.body)} RETURNING *`
    )[0];
    res.json(added);
  } catch (err) {
    next(err);
  }
};
const sendPatch = async (req, res, next, table) => {
  try {
    const { id } = req.params;
    const updated = (
      await sql` 
     UPDATE ${sql(`${table}`)} SET ${sql(
        req.body
      )} WHERE id = ${id} RETURNING *`
    )[0];
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

app.use(cors())
app.set('proxy server',1)
app.use(express.static("static"));
app.use(express.json());
app.use("/api/products", products);
app.use("/api/users", users);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
});

app.use((req, res) => {
  res.status(404).type("text").send(`Page Not Found `);
});
app.listen(PORT, () => {
  console.log(`SERVER live on localhost:${PORT}`);
});
