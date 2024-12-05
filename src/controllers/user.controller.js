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
import User from "../models/user.model.js";
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

    const { fullName, email, password, phoneNumber } = req.body;

    const existedUser = await User.findOne({ email });

    if (existedUser) {
        throw new apiError(409, "User already exists");
    }

    const profileLocalPath = req.file?.path;

    if (!profileLocalPath) {
      throw new apiError(400, "Profile image is required");
    }

    const profile = await uploadOnCloudinary(profileLocalPath);

    console.log(profile);

    if (!profile) {
      throw new apiError(400, "Profile image upload failed");
    }

    const user = await createUser({ 
        firstName: fullName.firstName, 
        lastName: fullName.lastName, 
        email, 
        password, 
        profile: profile.secure_url, 
        phoneNumber 
    });

    res
    .cookie(
        "accessToken", 
        user.accessToken, 
        cookieOptions
    )
    .cookie("refreshToken", 
        user.refreshToken, 
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
                accessToken: user.accessToken,
                refreshToken: user.refreshToken
            }, 
            "User created successfully"
        )
    );

});

export {
    registerUser,
}