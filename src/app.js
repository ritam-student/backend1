import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use (cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))

app.use(express.json({limit : "16kb"}))            // to except data in the form of json file from user
app.use(express.urlencoded({extended : true, limit : "16kb"}))      // to encode data from url
app.use(express.static("public"))     // to store temporary files , img in 'public' folder before uploading on database
app.use(cookieParser())    // to access and perform CRUD operation on users cookies that only can send the server and access it.


//   import router
import userRouter from "./routes/user.routes.js";


// routes declaration
app.use("/api/v1/users", userRouter);
// http://localhost:8000/uesrs/register


export {app};
