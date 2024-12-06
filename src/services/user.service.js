import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import generateAccessAndRefreshToken from "./generate.tokens.service.js";

const createUser = asyncHandler(async ({ firstName, lastName, email, password, profile, phoneNumber }) => {

    if( !firstName || !email || !password || !profile || !phoneNumber ) {
        throw new apiError(400, "All fields are required");
    }

    const user = await User.create({ 
        firstName, 
        lastName, 
        email, 
        password,
        profile,
        phoneNumber 
    });

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id, User);
    
    user.accessToken = accessToken;
    user.refreshToken = refreshToken;

    if( !user ) {
        await deleteFromCloudinary(profile);
        throw new apiError(400, "User not created");
    }

    return new apiResponse(201, user);
});

export {
    createUser,
}