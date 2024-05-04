class ApiError extends Error {
    constructor (
        statusCode,
        message = "something went wrong",   // bydefault message
        errors = [],
        stack = ""      // error stack
    ){
        super (message)          // this calls the constructor of the parent class ('Error'), passing the 'message'property of the error
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors


        if (stack) {
            this.stack = stack
        }else {
            Error.captureStackTrace(this,this.constructor)     // built in method in Node.js for capturing stack trace
        }
    }
}

export {ApiError};