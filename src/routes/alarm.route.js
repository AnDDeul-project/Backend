import express from "express";
import { countalarm } from "../controllers/alarm.controller.js";

export const alarmRoute = express.Router();

alarmRoute.get('/:place', countalarm);