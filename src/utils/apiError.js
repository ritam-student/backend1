class ApiError extends Error {
    constructor (
        statusCode,
        message = "something went wrong",
        errors = [],
        statck = ""
    ){
        super (message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors


        if (statc) {
            this.statck = statck
        }else {
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError};