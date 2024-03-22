const asyncHandler = () => {
    (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((err) => next(err))
    }
}



export {asyncHandler};

// another way of writting the same

/**const asyncHandler1 = (fn) => async (req,res,next) => {
    try {
        
    } catch (error) {
        res.status(err.code || 500).json ({
            success : false,
            message : err.message
        })
    }
}
*/