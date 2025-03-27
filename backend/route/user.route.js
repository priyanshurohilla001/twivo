import express from 'express';
import { addFriend, getUserDashboard } from "../controller/user.controller.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message : "Welcome to the user route",
  })
});


router.get("/basicinfo",(req, res) => {
  return res.json(req.user);
})

router.post("/add-friend",addFriend)


router.get("/dashboard", getUserDashboard);

export default router;
