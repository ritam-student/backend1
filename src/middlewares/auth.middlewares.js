import {ApiError} from "../utils/apiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";


export const verifyJwt = asyncHandler(async (req,_,next) => {      // '_' represents 'res' which is not in use 
    try {
        const token = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ","");
        if (!token) {
            throw new ApiError(401,"unauthorized request")
        }
        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET);
    
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