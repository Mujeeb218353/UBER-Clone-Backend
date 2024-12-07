import { apiError } from "../utils/apiError.js";

const generateAccessAndRefreshToken = async (entityId, entityModel) => {
  
    try {
      const entity = await entityModel.findById(entityId);
      
      if (!entity) {
        throw new apiError(404, "Entity not found");
      }
    
      const accessToken = entity.generateAccessToken();
      const refreshToken = entity.generateRefreshToken();

      entity.refreshToken = refreshToken;
      await entity.save({ validateBeforeSave: false });
      
      return {
        accessToken,
        refreshToken
      }
    } catch (error) {
      throw new apiError(500, error?.message || "Internal server error");
    }
}

export default generateAccessAndRefreshToken;