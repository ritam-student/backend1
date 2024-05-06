import multer from "multer";

// we create a middleware using multer so that whenever we have to upload some file on server we can use multer as a middleware

const storage = multer.diskStorage({          // method to store the file on doskstorage // try to avoid memorystorage
    destination:function (req,file,cb) {      // this file is present in multer only
        cb(null,"./public/temp")              // folder where to store all the file
    },
    filename : function (req,file,cb) {  // cb means callback
        cb(null,file.originalname)       // so this 'originalname' returns the localpath address
    }
})


export const upload = multer({ 
    storage ,
}); 