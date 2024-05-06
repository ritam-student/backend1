import {v2 as cloudinary} from "cloudinary";   // here we import v2 from cloudinary and named it as 'cloudinary'  so cloudinary = cloudinary.v2
import fs from "fs";   // 'fs' is fileSystem which is a inbulit file inn node.js

cloudinary.config({         // this configuration helps understanding context of coudinary account 
    cloud_name : process.env.CLOUD_NAME,
    api_key : process.env.API_KEY,
    api_secret : process.env.API_SECRET
});

// once the file has been saved in our server now we go for uploading the file on cloudinary

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.error("could not find the file path....");
            return null;
        }        // if localpath is empty
        // upload asset on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {   // cloudinary.v2.uploader.upload({})
            resource_type : "auto"
        })
        // file upload successfull
        console.log("file  upload successfully ", response.url);
        fs.unlinkSync(localFilePath);       // delete uploaded file
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); // remove the locally saved file as rthe upload opperation failed
        return null;
    }
}

export {uploadOnCloudinary};