import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
        coverImage : {
            type : String,          // cloudinary url 
        },
        watchhistory : [             // depends on videos 
            {           
                type : mongoose.Schema.Types.ObjectId,
                ref : "video"
            }
        ],
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


userSchema.pre("save",async function (next) {             // middleware function , // it listen for the 'save' event
    if (!this.isModified("password")) return next();       // check whether password is changed or not
    this.password = bcrypt.hash(this.password,10)
    next()                                              // indicates that the middleware function has executed 
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id : this._id,
        email : this.email,
        username : this.username,
        fullname : this.fullname
    },process.env.ACCESS_TOKEN_SECRET,{
        expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    })
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id : this.id
    },process.env.REFRESH_TOKEN_SECRET,{
        expiresIn : process.env.REFRESH_TOKEN_EXPIRY
    })
}

export const User = mongoose.model(User,userSchema);