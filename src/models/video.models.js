import mongoose from  "mongoose";
import mongooseAggregatePaginatev2 from "mongoose-aggregate-paginate-v2";

// creating a videos model

const videoschema = new mongoose.Schema (
    {
        videofile : {
            type : String ,            // cloudinary url
            required : true
        },
        thumbnail : {
            type : String ,            // cloudinary url
            required : true
        },
        owner : {
            type : mongoose.Schema.Types.ObjectId ,  
            ref : "user",          
            required : true
        },
        title : {
            type : String ,            
            required : true
        },
        description : {
            type : String ,            
            required : true
        },
        duration : {
            type : Number ,         // get from cloudinary   
            required : true
        },
        views : {
            type : Number ,            
            default : 0
        },
        ispublished : {
            type : Boolean , 
            default : true
        },
    }, 
    {timestamps : true});


videoschema.plugin(mongooseAggregatePaginatev2);

export const Video = mongoose.model(Video , "videoSchema");