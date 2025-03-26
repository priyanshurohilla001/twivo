import axios from "axios";

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
