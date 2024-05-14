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
        watchhistory : [             // depends on videos           // add later
            {           
                type : mongoose.Schema.Types.ObjectId,
                ref : "video"
            }
        ],
        password : {
            type : String,
            required : [true, 'password is required']           //custom message 
        },
        refreshtoken : {                                         // add later
            type : String
        }
    },
    {timestamps : true}
);



userSchema.pre("save",async function (next) {             // middleware function in mongoose , // it listen for the 'save' event
    if (!this.isModified("password")) return next();       // 'isModified()' is a method provided by mongoose to check whether password is changed or not
    this.password = await bcrypt.hash(this.password,10)    // 10 is the number of salt rounds used for hashing , higher number of rounds provides greater security but increase the time it takes to hash password
    next()                                              // indicates that the middleware function has executed 
});



userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password)  // this returns true or false value based on condition
}



// access tokens are short lived
userSchema.methods.generateAccessToken = function () {     // every  user instance created using this schema will have access to this method
    return jwt.sign({      // this method is commonly used for generating jwt
        _id : this._id,                   // data that will  be encoded into the jwt
        email : this.email,              //     ||
        username : this.username,        //     ||
        fullname : this.fullname         //     ||
    },process.env.ACCESS_TOKEN_SECRET,{      // secret key used to  sign  the jwt 
        expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    })
}  // this method('jwt.sign()') returns a "jwt string " with the provided payload , using the secret key and expiration time


userSchema.methods.generateRefreshToken = function () {            // refresh tokens are comparatively long lived
    return jwt.sign({
        _id : this._id
    },process.env.REFRESH_TOKEN_SECRET,{
        expiresIn : process.env.REFRESH_TOKEN_EXPIRY
    })
}


/**
 * jwt are generated  using cryptographic algorithms , typically one of the HMAC OR RSA algorithms. the process involves encoding a json payload 
 * and signing it with a secret key to create a token.
 * this JWT consists 3 parts -> header , payload(data, expiration time and secret token ) , signature. and the payload and header is connected 
 * with a period('.') separator
 */

export const User = mongoose.model("User",userSchema);