import User from "../model/user.model.js";

export default async function basicUserInfo(req, res, next) {
  const sub = req.auth.payload.sub;
  try {
    const response = await User.findOne({ sub });
    if(!response){
      return res.status(404).json({
        success: false,
        message: "User not found corresponding to the sub",
        userOnboarding: false,
      })
    }
    req.user = response
  } catch (error) {
    console.log("error occured in basicUserInfo middleware" , error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }

  next();
}
