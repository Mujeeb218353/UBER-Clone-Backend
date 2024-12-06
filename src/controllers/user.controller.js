import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { createUser } from "../services/user.service.js";

const cookieOptions = {
    httpOnly: true,
    secure: true,
}

const registerUser = asyncHandler(async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, phoneNumber } = req.body;

    const existedUser = await User.findOne({ email });

    if (existedUser) {
        throw new apiError(409, "User already exists");
    }

    const profileLocalPath = req.file?.path;

    if (!profileLocalPath) {
      throw new apiError(400, "Profile image is required");
    }

    const profile = await uploadOnCloudinary(profileLocalPath);

    // console.log(profile);

    if (!profile) {
      throw new apiError(400, "Profile image upload failed");
    }

    const { user, accessToken, refreshToken} = await createUser({ 
        firstName, 
        lastName, 
        email, 
        password, 
        profile: profile.secure_url, 
        phoneNumber 
    });

    if (!user || !accessToken || !refreshToken) {
        throw new apiError(400, "User creation failed");
    }

    res
    .cookie(
        "accessToken", 
        accessToken, 
        cookieOptions
    )
    .cookie("refreshToken", 
        refreshToken, 
        cookieOptions
    )
    .status(
        201
    )
    .json(
        new apiResponse(
            201, 
            {
                user,
                accessToken,
                refreshToken
            }, 
            "User created successfully"
        )
    );

});

export {
    registerUser,
}