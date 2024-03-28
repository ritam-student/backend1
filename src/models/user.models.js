import mongoose from "mongoose";

// creating an user model

const userSchema = new mongoose.Schema(
    {
        username : {
            type : String,
            required : true,
            unique : true ,
            lowercase : true,
            trim : true,
            index : true              // helps in searching from db
        },
        email : {
            type : String,
            required : true,
            unique : true ,
            lowercase : true,
            trim : true,
        },
        fullname : {
            type : String,
            required : true,
            trim : true,
            index : true
        },
        avatar : {
            type : String,          // cloudinary url
            required : true,
        },
        avatar : {
            type : String,          
        },
        watchhistory : {           // depends on videos 
            type : mongoose.Schema.Types.ObjectId,
            ref : "video"
        },
        password : {
            type : String,
            required : [true, 'password is required']           //custom message 
        },
        refreshtoken : {
            type : String
        }
    },
    {timestamps : true}
    );

export const User = mongoose.model(User,userSchema);