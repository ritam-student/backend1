import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Apiresponse } from "../utils/Apiresponse.js";

// register user

const registerUser = asyncHandler ( async (req,res) => { 

    /**res.status(200).json({
        message : "postman done"
    })*/


    
    // step 1 :  take user details fromm frontend
    const {username , email , password , fullname } = req.body;        // to get data from body or form    // use postman
    // stpr 2 :  validation of all the fields, whether fileds are empty or not
    if(fullname === "") {
        throw new ApiError(400, "fullname is required ");
    }
    if(password === "") {
        throw new ApiError(400, "password is required ");
    }
    if(email === "") {
        throw new ApiError(400, "email is required ");
    }
    if(username === "") {
        throw new ApiError(400, "username is required ");
    }
    // stpe 3 :  check if user already exists ? {check using :  username (for instagram), email }
    const existedUser = User.findOne({
        $or: [{username},{email}]
    })
    if (existedUser) {
        throw new ApiError(400, "user already exists...");
    }
    // step 4 :  check for images and avtar(imp)
    const avatarLocalPath = req.files?.avatar[0]?.Path;
    const coverImageLocalPath = req.files?.coverImage[0]?.Path;
    if(!avatarLocalPath) {
        throw new ApiError(400, "avatar is required...");
    }
    // step 5 :  upload imgaes on cloudinary and check if avator is uploaded on cloudinary successfully 
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath) ;

    if (!avatar) {
        throw new ApiError(500, "something went wrong...");
    }
    // step 6 :  create user object(nosql database) and create entry in database 
    const userObj = await User.create({           // craete user object
        username: username.toLowerCase(),
        fullname,
        email,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        password
    })
    // step 7 :  remove password and refresh token field from response
    const createdUser = await User.findById(userObj._id).select(          // check if object is created ?
        "-password -refreshToken" 
    )
    // step 8 :  check for successful user creation
    if(!createdUser) {
        throw new ApiError(500, "Try sometimes later...");
    }
    // step 9 : return response to frontend
    return res.status(200).json(
        new Apiresponse(200,createdUser,"user register successfully..")
    )
})


export {registerUser};