import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler"
import jwt from "jsonwebtoken"
import { User } from "../models/user.models";


export const verifyJwt = asyncHandler(async (req,_,next) => {      // '_' represents 'res'
    try {
        const token = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ","");
        if (!token) {
            throw new ApiError(401,"unauthorized request")
        }
        const decodedToken = jwt.verify(tokenprocess.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshtoken")
        
        if (!user) {
            throw new ApiError(401,"Invalid access token")
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token" )
    }

})