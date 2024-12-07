import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { BlacklistToken } from "../models/blackListToken.model.js";

const verifyUserJWT = asyncHandler(async (req, _, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new apiError(401, "Unauthorized request");
    }

    const isBlacklisted = await BlacklistToken.findOne({ token });

    if (isBlacklisted) {
      throw new apiError(401, "Unauthorized request");
    }

    let decodedToken;

    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new apiError(401, "Access token expired");
      }
      throw new apiError(401, "Invalid access token");
    }

    const user = await User.findById(decodedToken?._id)

    if (!user) {
      throw new apiError(401, "Invalid Access Token");
    }

    req.user = user;

    next();
  } catch (error) {
    throw new apiError(401, error?.message || "Invalid access token");
  }
});

export { verifyUserJWT };