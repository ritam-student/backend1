import multer from "multer";   // multer is a middleware for handling multipart/ form-data, which used for uploading files 

// we create a middleware using multer so that whenever we have to upload some file on server we can use multer as a middleware

const storage = multer.diskStorage({          // 'diskstorage' used to store files in 'disk' directly  // try to avoid memorystorage
    destination: function (req,file,cb) {      // this file is present in multer only
        cb(null,"./public/temp")              // 'cb' takes 2 parameters -> 1) an error if any 2) destination directory path
    },                      // 'file' object contains information about the uploaded file(name, size etc)
    filename : function (req,file,cb) {  // cb means callback
        cb(null,file.originalname)       // so this 'originalname' returns the localpath address
    }
})


export const upload = multer({      // initializes 'multer' middleware instances
    storage ,   // by passing the object , I am telling the multer to use the configured storage engine for handling file uploads 
}); 