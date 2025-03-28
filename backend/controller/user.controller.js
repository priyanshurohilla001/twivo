import axios from "axios";
import { z } from "zod";
import User from "../model/user.model.js";

export async function getUserDashboard(req, res) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Extract the token from the header

  if (!token) {
    return res.status(401).send("Token not provided");
  }

  try {
    const userInfoResponse = await axios.get(
      `https://${process.env.AUTH0_DOMAIN}/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "User info fetched successfully",
      userInfo: userInfoResponse.data,
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function userOnboarding(req, res) {
  const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    username: z
      .string()
      .min(6, "Username must be at least 6 characters")
      .max(12, "Username must be at most 12 characters")
      .regex(
        /^[a-zA-Z0-9]+$/,
        "Username must contain only alphanumeric characters"
      ),
  });

  try {
    const sub = req.auth.payload.sub;

    // Validate request body
    const validationResult = formSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.errors,
      });
    }

    const { name, username } = validationResult.data;

    const existingUser = await User.findOne({
      $or: [{ sub }, { username }],
    });

    if (existingUser) {
      if (existingUser.sub === sub) {
        return res.status(409).json({
          success: false,
          message: "User already onboarded",
        });
      }

      if (existingUser.username === username) {
        return res.status(409).json({
          success: false,
          message: "Username already exists",
        });
      }
    }

    // Email from the auth0
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Extract the token from the header

    if (!token) {
      return res.status(401).send("Token not provided");
    }
    const userInfoResponse = await axios.get(
      `https://${process.env.AUTH0_DOMAIN}/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!userInfoResponse.data) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { email } = userInfoResponse.data;
    if (!email) {
      return res.status(401).json({
        success: false,
        message: "Email not found in user info",
      });
    }

    // Create a new user
    const newUser = await User.create({
      sub,
      username,
      email,
      name,
    });

    return res.status(201).json({
      success: true,
      message: "User onboarded successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error in onboarding:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
