import { app } from "./app.js";
import connectDB from "./db/index.js";        // as 'connectdb' exports default
import dotenv from "dotenv";          // require('dotenv').config({path : './env'})       another way to use dotENV
dotenv.config ({
    path : "./env"
});

connectDB()
.then(() => {                                   // to handle promises
    app.on ("error", (err) => {                 // listening an event named 'error' 
        console.log ("error is : ", err);
    })
    app.listen (process.env.PORT || 8000 , () => {
        console.log(`server is running at port :  ${process.env.PORT} `);
    })
})
.catch((err) => {
    console.log("MongoDB connection failed ... ", err);
});































/** 
// connecting database using IIFE (approach 2)
import mongoose from "mongoose";
import {DB_NAME} from "./constants.js"
import express from "express ";
const app = express();

; (async () => {
    try {
       await  mongoose.connect(`${MONGODB_URL}/${DB_NAME}`);
        app.on("error", (error)=> {
            console.log("Express connection failed ", error);
            throw error;
        });
        app.listen(process.env.PORT || 8000 , ()=> {
            console.log(`App is listening on port no ${process.env.PORT}`);
        })
    }catch (error) {
        console.error("Error is ", error);
        throw error;
    }
})()
*/