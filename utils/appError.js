// Personal error class
class AppError extends Error {
  constructor(message, statusCode) {
    // The super class Error by takes an argument and sets it as the object.message field
    super(message);

    this.statusCode = statusCode;
    // if the statusCode is 404 its a fail. If it is 500 its an error
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
