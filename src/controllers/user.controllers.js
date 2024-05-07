import { asyncHandler } from "../utils/asyncHandler.js";

// register user

const registerUser = asyncHandler ( async (req,res) => { 
    // step 1 :  take user details fromm frontend
    const {username , email , password , fullname } = req.body;        // to get data from body or form
    // stpr 2 :  validation of all the fields, whether fileds are empty or not
    // stpe 3 :  check if user already exists ? {check using :  username (for instagram), email }
    // step 4 :  check for images and avtar(imp)
    // step 5 :  upload imgaes on cloudinary and check if avator is uploaded on cloudinary successfully 
    // step 6 :  create user object(nosql database) and create entry in database 
    // step 7 :  remove password and refresh token field from response
    // step 8 :  check for successful user creation
    // step 9 : return response to frontend
})


export {registerUser};