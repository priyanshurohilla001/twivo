import User from "../model/user.model.js";
import { usernameSchema } from "../zodTypes.js";
import mongoose from "mongoose";

export async function sendFriendReq(req, res) {
  const parsedResult = usernameSchema.safeParse(req.body);
  if (!parsedResult.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid input",
      error: parsedResult.error.errors,
    });
  }

  const { username } = parsedResult.data;
  const currentUserSub = req.auth.payload.sub;

  try {
    const friend = await User.findOne({ username });
    if (!friend) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const currentUser = req.user;

    if (currentUser.username === username) {
      return res.status(400).json({
        success: false,
        message: "You cannot add yourself as a friend",
      });
    }

    // Check if the friend request already exists
    const friendIndex = friend.friends.findIndex(
      (f) => f.friend.toString() === currentUser._id.toString()
    );

    if (friendIndex !== -1) {
      return res.status(400).json({
        success: false,
        message: "Friend request already sent",
      });
    }

    friend.friends.push({
      friend: currentUser._id,
      username: currentUser.username,
      accepted: false,
    });

    await friend.save();

    return res.status(200).json({
      success: true,
      message: "Friend request sent",
    });
  } catch (error) {
    console.error("Error adding friend:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

export async function acceptFriendReq(req, res) {
  const parsedResult = usernameSchema.safeParse(req.body);
  if (!parsedResult.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid input",
      error: parsedResult.error.errors,
    });
  }
  const { username } = parsedResult.data;
  const currentUserSub = req.auth.payload.sub;

  // Start a session
  const session = await mongoose.startSession();

  try {
    let result;

    // Start a transaction
    await session.withTransaction(async () => {
      const friend = await User.findOne({ username }).session(session);
      if (!friend) {
        throw new Error("Friend not found");
      }

      const currentUser = req.user;

      const friendRequestIndex = currentUser.friends.findIndex(
        (f) => f.friend.toString() === friend._id.toString()
      );

      if (friendRequestIndex === -1) {
        throw new Error("No friend request found");
      }

      // Update current user's friends array
      currentUser.friends[friendRequestIndex].accepted = true;
      await currentUser.save({ session });

      // Update friend's friends array
      friend.friends.push({
        friend: currentUser._id,
        username: currentUser.username,
        accepted: true,
      });
      await friend.save({ session });

      result = {
        success: true,
        message: "Friend request accepted",
        user: currentUser,
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  } finally {
    session.endSession();
  }
}

export async function removeFriendReq(req, res) {
  const parsedResult = usernameSchema.safeParse(req.body);
  if (!parsedResult.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid input",
      error: parsedResult.error.errors,
    });
  }
  const { username } = parsedResult.data;
  const currentUserSub = req.auth.payload.sub;

  try {
    const currentUser = req.user;

    const friendIndex = currentUser.friends.findIndex(
      (f) => f.username.toString() === username.toString()
    );

    if (friendIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Friend not found in your list",
      });
    }

    currentUser.friends.splice(friendIndex, 1);
    await currentUser.save();

    return res.status(200).json({
      success: true,
      message: "Friend removed successfully",
      user: currentUser,
    });
  } catch (error) {
    console.error("Error removing friend:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

export async function removeFriend(req, res) {
  const parsedResult = usernameSchema.safeParse(req.body);
  if (!parsedResult.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid input",
      error: parsedResult.error.errors,
    });
  }
  const { username } = parsedResult.data;
  const currentUserSub = req.auth.payload.sub;

  try {
    const currentUser = req.user;

    const friendIndex = currentUser.friends.findIndex(
      (f) => f.username.toString() === username.toString()
    );

    if (friendIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Friend not found in your list",
      });
    }

    const session = await mongoose.startSession();


    try {
      let result;
      await session.withTransaction(async () => {
        // remove friend from current user
        currentUser.friends.splice(friendIndex, 1);
        await currentUser.save({ session });

        // remove current user from friend's list
        const friend = await User.findOneAndUpdate(
          {username},
          {
            $pull: {
              friends: {
                friend: currentUser._id,
                username: currentUser.username,
              },
            },
          },
          { session }
        );

        if (!friend) {
          throw new Error("Friend not found");
        }

        result = {
          success: true,
          message : "Friend removed successfully",
          user: currentUser,
        }

      });

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error removing friend:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Error removing friend:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

export async function getFriendsList(req, res) {
  const currentUserSub = req.auth.payload.sub;

  try {
    const currentUser = await User.findOne({ sub: currentUserSub }).populate(
      "friends.friend"
    );
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const friendsList = currentUser.friends.map((friend) => ({
      id: friend.friend._id,
      name: friend.friend.name,
      email: friend.friend.email,
      username: friend.friend.username,
      accepted: friend.accepted,
      onlineStatus: false,
    }));

    return res.status(200).json({
      success: true,
      friends: friendsList,
    });
  } catch (error) {
    console.error("Error fetching friends list:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}
