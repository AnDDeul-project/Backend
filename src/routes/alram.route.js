import express from "express";
import { countAlram } from "../controllers/alram.controller.js";

export const alramRoute = express.Router();

alramRoute.get('/:place', countAlram);