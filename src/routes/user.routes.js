import { Router } from "express";
import { logOutUser, loginUser, registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",   // 1st file should be 'avatar'
            maxCount: 1
        },
        {
            name: "coverImage",     // 2nd file should be ocverImage
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

export default router ;