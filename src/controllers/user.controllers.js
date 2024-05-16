import { asyncHandler } from "../utils/asyncHandler.js";  // utility function for handling asynchronous opperation
import { ApiError } from "../utils/apiError.js";  // utility function for handling api response while facing errors
import { User } from "../models/user.models.js";   // data model for a user object
import { uploadOnCloudinary } from "../utils/cloudinary.js";  // utility function to upload files on cloudinary
import { Apiresponse } from "../utils/Apiresponse.js";  // utility function for handling api response after success
import jwt from "jsonwebtoken";  // this library commonly used for generating and verifying json web tokens

// req.user?._id returns a string , but when we pass this inside 'User.findById()' mongoose change it and make it mongodb ID

const generateAccessAndRefreshToken = async (userId) => {             // method to generate access and refresh token
    try {
        const user = await User.findById(userId);  // it returns : a user object that contains all the details of the user(username, email...) if the 'userId' is found  in database else return 'null or undefined'
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
    const {username, email, password, fullname } = req.body;        // to get data from body or form    // use postman
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
    const existedUser = await User.findOne({           // User can directly contact with database
        $or: [{username},{email}]              // '$or' is an mongodb opporator 
    })
    if (existedUser) {
        throw new ApiError(400, "user already exists...");
    }

   // console.log(req.file); It prints 2 array 1) avatar 2) coverImage , each array consists an object of details  (fieldname , originalname , maimetype , destination , path , encoding , size, filename)
    // step 4 :  check for images and avtar(imp)
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;  // if covevrImage is not given then this line throw error
    // so check if coverImage is given or not and then move accordingly

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }



    if(!avatarLocalPath) {
        throw new ApiError(400, "avatar is required...");
    }
    // step 5 :  upload imgaes on cloudinary and check if avator is uploaded on cloudinary successfully 
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath) ;// if coverimage is not given , then cloudinary will return an empty string

    if (!avatar) {
        throw new ApiError(500, "something went wrong...");
    }
    // step 6 :  create user object(nosql database) and create entry in database 
    const userObj = await User.create({           // craete user object
        fullname,
        email,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        password,
        username: username?.toLowerCase() || username
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
    return res
    .status(200)
    .json(
        new Apiresponse(200,createdUser,"user register successfully..")
    )
})


// login user

const loginUser = asyncHandler(async (req,res) => {
    // step 1 : collect data from user
    const {username , email , password} = req.body;
    // step 2 : verify username or email is given or not
    if (!username && !email) {
        throw new ApiError(400,"username or email is required..");
    }
    // step 3 : find the user
    const user = await User.findOne({     // uptill here this user does not have any refresh token
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "user not found..");
    }
    // step 4 : check password
    const correctPassword = await user.isPasswordCorrect(password);
    if (!correctPassword) {
        throw new ApiError(400,"invalid credentials");
    }
    // step 5 : generate  access and refresh token to the user
    const {accesstoken , refreshtoken} = await  generateAccessAndRefreshToken(user._id);  // here user have stored refresh token
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
        " logged in successfully..."
        )
    )
})



const logOutUser = asyncHandler ( async (req,res) => {
    // step 1 : clear user's browsers cookies
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {            // '$unset' is a mongodb operator
                refreshtoken: 1
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
    .clearCookie("refreshtoken", options)
    .json(new Apiresponse(200,{},"user logged out"))
})

// endpoint/controllers for 'refresh token' refresh  when use's accesstoken validation ends

const refreshAccessToken = asyncHandler (async (req,res) => {
    try {
        // step 1 : recieve refresh token from cookies
        const incomingrefreshtoken = req.cookies.refreshtoken || req.body.refreshtoken; // for mobile user
        if (!incomingrefreshtoken) {
            throw new ApiError(401,"unauthorized request");
        }
        // step 2 : check refresh token with database's refresh token
        const decodedtoken = jwt.verify(incomingrefreshtoken,process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedtoken._id);
        if (!user) {
            throw new ApiError(401,"invalid refresh token");
        }
        if (incomingrefreshtoken !== user?.refreshtoken) {
            throw new ApiError(401,"refresh token expired")
        }
        // step 3 : if match send a new access token and update stored refresh token with new access token
        const {accesstoken , refreshtoken} = await generateAccessAndRefreshToken(user._id);
        const options = {
            httpOnly: true,
            secure:true
        }
        return res
        .status(200)
        .cookie("accessToken", accesstoken, options)
        .cookie("refreshToken", refreshtoken, options)
        .json(new Apiresponse(200,
            {
                accesstoken,
                refreshtoken
            },
            "access token refreshed successfully"
        ))
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid refresh token")
    }
})


const changeCurrentPassword = asyncHandler (async (req,res) => {
    try {
        // step1 : taken values from body
        const {oldPassword , newPassword , confPassword} = req.body;
        if (newPassword !== confPassword) { 
            throw new ApiError(401, "your newpassword  and confpassword is not same");
        }
        // step2 : check password values if matches or not
        const user = User.findById(req.user?._id);
        const checkPassword = await user.isPasswordCorrect(oldPassword);
        if (!checkPassword) {
            throw new ApiError(401, "enter correct password...");
        }
        // step3 : replace the password in database
        user.password = newPassword;
        await user.save({validateBeforeSave:false})
        return res
        .sattus(200)
        .json(new Apiresponse(200, {}, "password change successfully"))
    } catch (error) {
        throw new ApiError(500, "Password not changed , please try after sometimes...");
    }
})


const getCurrentUser = asyncHandler(async (req,res)=> {
    try {
        const user = await User.findById(req.user?._id).select("-password -refreshtoken")
        return res
        .status(200)
        .json(new Apiresponse(200,user,"fetch details successfully"))
    } catch (error) {
        throw new ApiError(500, "Password not changed , please try after sometimes...");
    }
})


const updateAccountDetails = asyncHandler (async (req, res) => {
    // take values from body
    const {newFullname, newUsername, newEmail} = req.body;
    // update values
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                username: newUsername,
                fullname: newFullname,
                email: newEmail
            }
        },
        {
            new : true
        }
    ).select("-password -refreshtoken")
    return  res.status(200)
    .json(new Apiresponse(200,user,"values updated successfully..."))

})


const updateAvatar = asyncHandler(async (req,res) => {
    const avatarLocalFilePath = req.file?.path;
    if (!avatarLocalFilePath) {
        throw new ApiError(401, "avtar is required..")
    }
    const newavatar = await uploadOnCloudinary(avatarLocalFilePath);
    if (!newavatar) {
        throw new ApiError(500, "something went wrong while uploading the file")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id, 
        {

            $set: {
                avatar: newavatar.url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshtoken")
    return res
    .status(200)
    .json(new Apiresponse(200,user,"avatar changed succcessfully"))
})


const updatecoverImage = asyncHandler(async (req,res) => {
    const coverImageLocalFilePath = req.file?.path;
    if (!coverImageLocalFilePath) {
        throw new ApiError(401, "coverImage is required..")
    }
    const newcoverImage = await uploadOnCloudinary(coverImageLocalFilePath);
    if (!newcoverImage) {
        throw new ApiError(500, "something went wrong while uploading the file")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id, 
        {
            $set: {
                coverImage: newcoverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshtoken")
    return res
    .status(200)
    .json(new Apiresponse(200,user,"coverImage changed succcessfully"))
})


const getUserChanelProfile = asyncHandler (async (req,res) => {
    const {username} = req.params;   // take it from 'URL' of the chanel when viewer hit the url
    // if username exists or not 
    if (!username) {
        throw new ApiError(400, "username does not exist..");
    }
    // aggregate pipelines return array
    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()     // match from the database based on username
            }
        },
        {
            $lookup:{    // to find no of subscriber of a particular username/channel (above mention 'username')
                from: "subscriptions",  // model name
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"   // name of the field
            }
        },
        {
            $lookup: {   // no of channel has alresdy subscribed by 'user'
                from:"subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo" // name of the field
            }
        },
        {       // user model a jkota field acha tar sathe subscriber and subscribedTo ae field 2to add kore daba
            $addFields: {
                subscribersCount : {
                    $size: "$subscribers"    // name of the field so '$' is used 
                },
                channelsSubscribedToCount : {
                    $size: "$subscribedTo"   // name of the field so '$' is used
                },
                isSubscribed: { // now return a true or false message based on which frontend can understand whether channel is subscribed or not
                    $cond: {
                        if: {$in: [req.user?._id, "$subacribers.subscriber"]},
                        then: true ,
                        else: false
                    }
                }
            }
        },
        {  // select some fields that is going to send when someone ask for this 
            $project: {
                fullname : 1,
                email: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1
            }
        }
         
    ])
    if (!channel?.length) {
        throw new ApiError(400, "channel doesnot exists...")
    }
    return res
    .status(200)
    .json(new Apiresponse(200,channel[0],"user channel fetch successfully..."))
})


const getWatchHistory = asyncHandler (async (req,res)=> {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)  // find user // here mongoose convert string into  mongodb _id automatically
            }
        },
        {
            $lookup: {
                from:"videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        fullname: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    }   // 20
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(new Apiresponse(200, user[0].watchHistory,"watch history fetch successfully..."))
})




export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updatecoverImage,
    getUserChanelProfile,
    getWatchHistory
};