import express from "express";
import {
  sendFriendReq,
  acceptFriendReq,
  removeFriend,
  getFriendsList,
  removeFriendReq,
} from "../controller/friend.controller.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the friend route",
  });
});

router.get("/list", getFriendsList);
router.post("/add", sendFriendReq);
router.post("/accept", acceptFriendReq);
router.post("/reject", removeFriendReq);
router.post("/remove", removeFriend);

export default router;
