import sql from "./database/db.js";
import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const { PORT } = process.env;

const products = express.Router();
const users = express.Router();

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

app.use(express.static("static"));
app.use(express.json());
app.use("/api/products", products);
app.use("/api/users", users);

products
  .route("/")
  .get(async (req, res, next) => {
    try {
      const products = await sql`
        SELECT * FROM products ORDER BY id ASC`;
      res.json(products);
    } catch (err) {
      next(err);
    }
  })
  .post(
    async (req, res, next) => {
      try {
        const { name, image, price, per_lb } = { ...req.body };

        if (!name || !image || !price || !per_lb.toString()) {
          res
            .status(400)
            .type("text")
            .send(`Bad Request: name, image, price, per_lb keys required`);
        } else {
          next();
        }
      } catch (err) {
        next(err);
      }
    },
    (req, res, next) => sendPost(req, res, next, "products")
  );

users
  .route("/")
  .post(
    async (req, res, next) => {
      try {
        const { name, email, phone, address } = { ...req.body };
        const tel = parseInt(phone);
        if (!name || !email || !address) {
          res
            .status(400)
            .type("text")
            .send(`Bad Request: name, email, address keys required`);
        } else if (
          (phone || phone === "") &&
          (isNaN(tel) || tel.toString().length !== 10)
        ) {
          res
            .status(400)
            .type("text")
            .send(`Bad Request: phone number must be valid`);
        } else {
          next();
        }
      } catch (err) {
        next(err);
      }
    },
    (req, res, next) => sendPost(req, res, next, "users")
  )
  .get(async (req, res, next) => {
    try {
      const users = await sql`
          SELECT * FROM users ORDER BY id ASC`;
      res.json(users);
    } catch (err) {
      next(err);
    }
  });

users.route("/:id").patch(
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (isNaN(id)) {
        next("route");
      } else {
        const item = (await sql`SELECT * FROM  users WHERE id = ${id} `)[0];
        if (item) {
          next();
        } else {
          next("route");
        }
      }
    } catch (err) {
      next(err);
    }
  },
  async (req, res, next) => sendPatch(req, res, next, "users")
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
});

app.use((req, res) => {
  res.status(404).type("text").send(`Page: ${req.url} Not Found `);
});
app.listen(PORT, () => {
  console.log(`SERVER live on localhost:${PORT}`);
});
