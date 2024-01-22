import express from "express";
import { randomController } from "../controllers/random.controller.js";

export const randomRoute = express.Router();
randomRoute.post('/new', randomController)