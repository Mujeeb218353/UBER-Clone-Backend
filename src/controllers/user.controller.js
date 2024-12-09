import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import {
    uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { validationResult } from "express-validator";
import { User } from "../models/user.model.js";
import { createUser } from "../services/user.service.js";
import generateAccessAndRefreshToken from "../services/generate.tokens.service.js";
import { BlacklistToken } from "../models/blackListToken.model.js";

const cookieOptions = {
    httpOnly: true,
    secure: true,
}

const registerUser = asyncHandler(async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json(new apiResponse(400, errors.array(), "Validation failed"));
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

    if (!profile) {
      throw new apiError(400, "Profile image upload failed");
    }

    const { user, accessToken, refreshToken } = await createUser({ 
        fullName:{
            firstName: fullName?.firstName, 
            lastName: fullName?.lastName,
        }, 
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

const loginUser = asyncHandler(async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json(new apiResponse(400, errors.array(), "Validation failed"));
    }

    const { email, password } = req.body;

    if (!email) {
        throw new apiError(400, "Email is required");
    }
    
    if (!password) {
        throw new apiError(400, "Password is required");
    }

    const user = await User.findOne({ email }).select("+password"); // select +password because it is not selected by default

    if (!user) {
        throw new apiError(404, "User not found");
    }    

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) { 
        throw new apiError(401, "Username or password is incorrect");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id, User);
  
    if (!accessToken || !refreshToken) {
      throw new apiError(400, "Token generation failed");
    }
    
    res
    .cookie(
        "accessToken", 
        accessToken, 
        cookieOptions
    )
    .cookie(
        "refreshToken", 
        refreshToken, 
        cookieOptions

    )
    .status(
        200 
    )
    .json(
        new apiResponse(
            200, 
            {
                user,
                accessToken,
                refreshToken
            }, 
            "Logged in successfully"
        )
    );

});

const logoutUser = asyncHandler(async (req, res) => {

    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new apiError(401, "Unauthorized request");
    }

    await BlacklistToken.create({ token });

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $unset: {
          refreshToken: 1,
        },
      },
      {
        new: true,
      }
    );

    if(!user) {
        throw new apiError(404, "User not found");
    }

    res
    .status(
        200
    )
    .clearCookie(
        "accessToken", 
        cookieOptions
    )
    .clearCookie(
        "refreshToken", 
        cookieOptions
    )
    .json(
        new apiResponse(
            200, 
            null, 
            "Logged out successfully"
        )
    );
});

const getUserProfile = asyncHandler(async (req, res) => {

    res
    .status(
        200
    ).
    json(
        new apiResponse(
            200, 
            req.user, 
            "Profile fetched successfully"
        )
    );
    
});

export {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile
}