import { Router } from "express";
import { logOutUser, loginUser, registerUser,refreshAccessToken,changeCurrentPassword, getCurrentUser, updateAccountDetails, updateAvatar, updatecoverImage , getUserChanelProfile , getWatchHistory} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",   // 1st file should be named as 'avatar' in frontend 
            maxCount: 1
        },
        {
            name: "coverImage",     // 2nd file should be named as 'coverImage' in frontend
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(
    loginUser
)

router.route("/logout").post(
    verifyJwt,           // middleware
    logOutUser
)

router.route("/refreshToken").post(refreshAccessToken)

router.route("/change-password").post(verifyJwt,changeCurrentPassword)

router.route("/userdetails").get(verifyJwt, getCurrentUser)

router.route("/update-details").patch(verifyJwt,updateAccountDetails)  // patch is used to update particular fields

router.route("/update-avatar").patch(
    verifyJwt,
    upload.single("avatar"),
    updateAvatar
)

router.route("/update-coverImage").patch(
    verifyJwt,
    upload.single("coverImage"),
    updatecoverImage
)

router.route("/c/:username").get(verifyJwt, getUserChanelProfile)   //   "/c/:username" ->  is used as data come from url "req.params"

router.route("/watchHistory").get(verifyJwt , getWatchHistory)

export default router ;