import express from "express";
import { familyController, deleteController } from "../controllers/family.controller.js";

export const familyRoute = express.Router();
familyRoute.put('/add', familyController)
familyRoute.delete('/delete', deleteController);