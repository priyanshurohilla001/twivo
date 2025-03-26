import express from 'express';
import { getUserDashboard } from "../controller/user.controller.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("User route");
});

router.get("/dashboard", getUserDashboard);

export default router;
