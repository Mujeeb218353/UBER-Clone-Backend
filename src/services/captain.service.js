import { Captain } from "../models/captain.model.js";
import { apiError } from "../utils/apiError.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import generateAccessAndRefreshToken from "./generate.tokens.service.js";

const createCaptain = async ({
  fullName,
  email,
  password,
  profile,
  phoneNumber,
  vehicle
}) => {
  if (!fullName.firstName || !email || !password || !profile || !phoneNumber || !vehicle.color || !vehicle.plate || !vehicle.capacity || !vehicle.vehicleType) {
    throw new apiError(400, "All fields are required");
  }
  try {
    const createdCaptain = await Captain.create({
      fullName: {
        firstName: fullName?.firstName,
        lastName: fullName?.lastName,
      },
      email,
      password,
      profile,
      phoneNumber,
      vehicle: {
        color: vehicle.color,
        plate: vehicle.plate,
        capacity: vehicle.capacity,
        vehicleType: vehicle.vehicleType
      }
    })

    const captain = await Captain.findById(createdCaptain._id);

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        captain._id,
        Captain
    );

    if (!accessToken || !refreshToken) {
      throw new apiError(400, "Token generation failed");
    }

    if (!captain) {
      await deleteFromCloudinary(profile);
      throw new apiError(400, "User not created");
    }

    return {
      captain,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    await deleteFromCloudinary(profile);
    throw new apiError(500, error?.message || "Internal server error");
  }
};

export { createCaptain };