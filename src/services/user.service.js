import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import generateAccessAndRefreshToken from "./generate.tokens.service.js";

const createUser = async ({
  firstName,
  lastName,
  email,
  password,
  profile,
  phoneNumber,
}) => {
  if (!firstName || !email || !password || !profile || !phoneNumber) {
    throw new apiError(400, "All fields are required");
  }
  try {
    const createdUser = await User.create({
      fullName: {
        firstName,
        lastName,
      },
      email,
      password,
      profile,
      phoneNumber,
    })

    const user = await User.findById(createdUser._id).select("-password");

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id,
      User
    );

    if (!accessToken || !refreshToken) {
      throw new apiError(400, "Token generation failed");
    }

    if (!user) {
      await deleteFromCloudinary(profile);
      throw new apiError(400, "User not created");
    }

    return {
      user,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    await deleteFromCloudinary(profile);
    throw new apiError(500, error?.message || "Internal server error");
  }
};

export { createUser };
