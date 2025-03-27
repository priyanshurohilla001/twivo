import User from "../model/user.model.js";
import { usernameSchema } from "../zodTypes.js";

export async function addFriendReq(req, res) {
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
    const currentUser = await User.findOne({ sub: currentUserSub });
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    const friendExists = currentUser.friends.some(f => 
      f.friend.toString() === friend._id.toString());

    if (friendExists) {
      return res.status(400).json({
        success: false,
        message: "Friend request already sent",
      });
    }
    
    if (!friendExists) {
      currentUser.friends.push({
        friend: friend._id,
        accepted: false
      });
      
      await currentUser.save();
    }
    
    return res.status(200).json({
      success: true,
      message: "Friend request sent",
    });
  } catch (error) {
    console.error("Error adding friend:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
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
    
    try {
        const friend = await User.findOne({ username });
        if (!friend) {
        return res.status(404).json({
            success: false,
            message: "Friend not found",
        });
        }
        const currentUser = await User.findOne({ sub: currentUserSub });
        if (!currentUser) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
        }
    
        const friendRequestIndex = currentUser.friends.findIndex(
        (f) => f.friend.toString() === friend._id.toString()
        );
    
        if (friendRequestIndex === -1) {
        return res.status(400).json({
            success: false,
            message: "No friend request found",
        });
        }
    
        currentUser.friends[friendRequestIndex].accepted = true;
        await currentUser.save();

        friend.friends.push({
            friend: currentUser._id,
            accepted: true
        });
        await friend.save();
        
        return res.status(200).json({
        success: true,
        message: "Friend request accepted",
        });
    } catch (error) {
        console.error("Error accepting friend request:", error);
        return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
        });
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
        const friend = await User.findOne({ username });
        if (!friend) {
        return res.status(404).json({
            success: false,
            message: "Friend not found",
        });
        }
        const currentUser = await User.findOne({ sub: currentUserSub });
        if (!currentUser) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
        }
    
        const friendIndex = currentUser.friends.findIndex(
        (f) => f.friend.toString() === friend._id.toString()
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
        });
    } catch (error) {
        console.error("Error removing friend:", error);
        return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
        });
    }

}
export async function getFriendsList(req, res) {
    const currentUserSub = req.auth.payload.sub;
    
    try {
        const currentUser = await User.findOne({ sub: currentUserSub }).populate('friends.friend');
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        console.log("populated friends", currentUser.friends);
        
        const friendsList = currentUser.friends.map(friend => ({
            id: friend.friend._id,
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
            error: error.message
        });
    }
}