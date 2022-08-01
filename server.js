import sql from "./database/db.js";
import express from "express";
import dotenv from "dotenv";
import products from "./routes/product.js";
import users from "./routes/users.js";
import cors from "cors";

dotenv.config();
const app = express();
const { PORT, NODE_ENV } = process.env;

app.use(cors());
app.set("proxy server", 1);
app.use(express.static("static"));
app.use(express.json());
app.use((req, res, next) => {
  if (NODE_ENV !== "production") console.log({METHOD:req.method,URL:req.url});

  next();
});
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
