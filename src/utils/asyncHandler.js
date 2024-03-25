const asyncHandler = (requestHandler) => {
    (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((err) => next(err))
    }
}



export {asyncHandler};

// another way of writting the same


// const asyncHandler1 = () => {}
// const asyncHandler1 = (function) => {async () => {}}

/**const asyncHandler1 = (fn) => async (req,res,next) => {
    try {
        await fn(req,res,next);
    } catch (error) {
        res.status(err.code || 500).json ({
            success : false,
            message : err.message
        })
    }
}
*/