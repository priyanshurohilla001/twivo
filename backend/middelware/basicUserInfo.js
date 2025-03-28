import User from "../model/user.model.js";

export default async function basicUserInfo(req, res, next) {
  const sub = req.auth.payload.sub;
  try {
    const response = await User.findOne({ sub });
    if (!response) {
      return res.status(404).json({
        success: false,
        message: "User not found corresponding to the sub",
        userOnboarding: false,
      });
    }

    const userObj = response.toObject
      ? response.toObject()
      : JSON.parse(JSON.stringify(response));

    userObj.friends = userObj.friends.map((friend) => {
      // For mongoose subdocuments that might not spread correctly
      const plainFriend = friend.toObject
        ? friend.toObject()
        : JSON.parse(JSON.stringify(friend));
      plainFriend.onlineStatus = false;
      return plainFriend;
    });

    req.user = userObj;
  } catch (error) {
    console.log("error occured in basicUserInfo middleware", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }

  next();
}
