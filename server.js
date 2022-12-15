import express from "express";
import dotenv from "dotenv";
import products from "./routes/product.js";
import users from "./routes/users.js";
import cart from "./routes/cart.js";
import favorites from "./routes/favorites.js";
import lists from "./routes/lists.js";
import cors from "cors";

dotenv.config();
const app = express();
const { PORT, NODE_ENV } = process.env;
const devLog = (obj) => NODE_ENV !== "production" ? console.log(obj):null;

app.use(cors());
app.set("proxy server", 1);
app.use(express.static("public"));
app.use(express.json());
app.use((req, res, next) => {
  devLog({METHOD:req.method,URL:req.url});
  next();
});

app.use("/api/products", products);
app.use("/api/cart", cart);
app.use("/api/users", users);
app.use("/api/favorites", favorites);
app.use("/api/lists", lists);

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
