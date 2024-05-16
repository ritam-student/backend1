import {ApiError} from "../utils/apiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"                    // import jwt library
import { User } from "../models/user.models.js";   // imports the 'User' model , this model represents the user object and provides methids for interacting with the user data in the database



// 'next' is a function to call the next middleware in the stack
export const verifyJwt = asyncHandler(async (req,_,next) => {      // '_' represents 'res' which is not in use 
    try {
        const token = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ","");
        if (!token) {
            throw new ApiError(401,"unauthorized request")
        }
        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET);  // this returns the decoded tokens payload
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshtoken")
        
        if (!user) {
            throw new ApiError(401,"Invalid access token")
        }
        req.user = user;   // this line sets the 'user' object as a property of the 'request' object
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token" )
    }

})