import express from "express";
import { familyController } from "../controllers/family.controller.js";

export const familyRoute = express.Router();
familyRoute.post('/add', familyController)