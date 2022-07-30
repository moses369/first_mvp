import express from "express";
import dotenv from "dotenv";

import sendReq from "../nodeFetch.js";

dotenv.config();
const { NODE_ENV } = process.env;



const products = express.Router();
products.route("/").get(async (req, res, next) => {
  try {
    const data = await sendReq(req,next);
       res.json(data);
  } catch (err) {
    next(err);
  }
});

products.route("/:id").get(async (req, res, next) => {
  try {
    const { id } = req.params;
   const data = await sendReq(req,next,id)
    res.json(data)
  } catch (err) {
    next(err);
  }
});
export default products;
