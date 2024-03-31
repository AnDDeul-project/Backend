import express from "express";
import { familyController, deleteController, getinfoController, requestController } from "../controllers/family.controller.js";

export const familyRoute = express.Router();
familyRoute.put('/add', familyController);
familyRoute.get('/request', requestController);
familyRoute.get('/info/:family_code', getinfoController);
familyRoute.delete('/delete', deleteController);