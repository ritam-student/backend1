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
    {timestamps : true}
);


videoschema.plugin(mongooseAggregatePaginatev2); // to add the functionality providedy the plugin  'mongooseAggregatePaginatev2' plugin to a mongoose schema. // plugin is essentially a function that adds additional methods , statics or hooks to a schema .

export const Video = mongoose.model(Video , "videoSchema");




/**
 * pagination is a technique used in web dev and database querying to brake down large sets of data into smaller , more managable chunks or pages .
 * it  i)improves performence : pagination prevents the need to load and render large datasets all at once , leading to faster page load times and 
 * reduce server load.
 * ii) enhancing usability : users can navigate through data more easily , finding the information they need without having to shift through long 
 * list or wait for extensive data loading
 */