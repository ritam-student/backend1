import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Apiresponse } from "../utils/Apiresponse.js";


const generateAccessAndRefreshToken = async (userId) => {             // method to generate access and refresh token
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshtoken = refreshToken;
        user.save({validateBeforeSave : false});
        return {
            accessToken,
            refreshToken
        }
    } catch (error) {
        throw new ApiError(500,"something went wrong while generating tokens...");
    }
}

// register user

const registerUser = asyncHandler ( async (req,res) => { 

    /**res.status(200).json({
        message : "postman done"
    })*/

    //  ** 'User' is a mongodb object 
    
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
    const existedUser = await User.findOne({
        $or: [{username},{email}]              // '$or' is an mongodb opporator 
    })
    if (existedUser) {
        throw new ApiError(400, "user already exists...");
    }

   // console.log(req.file); It prints 2 objects 1) avatar 2) coverImage , each object consists an array of details if (fieldname , originalname , mainn type , destination , path , encoding )
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


// login user

const loginUser = asyncHandler(async (req,res) => {
    // step 1 : collect data from user
    const {username , email , password} = req.body;
    // step 2 : verify username or email is given or not
    if (!username || !email) {
        throw new ApiError(400,"username and email is required..");
    }
    // step 3 : find the user
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "user not found..");
    }
    // step 4 : check password
    const correctPasseord = await user.isPasswordCorrect(password);
    if (!correctPasseord) {
        throw new ApiError(400,"invalid credentials");
    }
    // step 5 : generate  access and refresh token to the user
    const {accesstoken , refreshtoken} = await  generateAccessAndRefreshToken(user._id);
    // step 6 : send tokens to user through cookies
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshtoken"
    )
    const options = {               // it helps so that only server can send cookies to the users browsers
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("acccesstoken" , accesstoken , options)
    .cookie("refreshtoken", refreshtoken, options)
    .json(
        new Apiresponse(
            200,
            {       // data object
                loggedInUser,
                accesstoken,
                refreshtoken
            },
        " logged in successfully...")
    )
})



const logOutUser = asyncHandler ( async (req,res) => {
    // step 1 : clear user's browsers cookies
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {            // '$set' is a mongodb operator
                refreshtoken: undefined
            }
        },
        {
            new : true       // return a updated response pabo setate refreshtoken: undefined hoacha 
        }
    )
    // now we don't have user's data is this method , so we have to create our own middleware
    // step 2 : reset user model's refresh token
    const options = {               // it helps so that only server can send cookies to the users browsers
        httpOnly : true,
        secure : true
    }
    return res
    .status(200)
    .clearCookie("accesstoken", options)
    .json(new Apiresponse(200,{},"user logged out"))
})


export {
    registerUser,
    loginUser,
    logOutUser
};