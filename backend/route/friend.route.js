import express from "express";
import {
  addFriendReq,
  acceptFriendReq,
  removeFriend,
  getFriendsList,
} from "../controller/friend.controller.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the friend route",
  });
});

router.get("/list", getFriendsList);
router.post("/add", addFriendReq);
router.post("/accept", acceptFriendReq);
router.post("/reject", removeFriend);

export default router;
