//standadized the api response => selecting the general format of an Api response

class Apiresponse {
    constructor (statusCode, data, message = success) {
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}