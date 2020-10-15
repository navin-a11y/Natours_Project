//const AppError = require("../utils/appError");
const AppError = require('./../utils/appError');
const errorMessage = require('./../configSettings/errorMessage.json');
const statusCode = require('./../configSettings/stausCode.json');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const handleDuplicateFieldDB = err => {
    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    console.log(value);

    const message = errorMessage.duplicacy.replace("VALUE", value);
    return new AppError(message, 400); 
};

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, statusCode.INVALID_REQ_DATA);
};

const handleJWTError = err => 
    new AppError(errorMessage.login, 401);

const handleJWTExpireError = err => 
    new AppError(errorMessage.login, 401);

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({ 
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) =>{
    // operational, trusted error: send message to client
    if(err.isOperational){
        res.status(err.statusCode).json({ 
            status: err.status,
            message: err.message
        });

        // programming or other unknown error; don;t leak error details
    } else{
        //log error
        console.log('Error!!', err);
        // send a generic error
        res.status(500).json({
            status: error,
            message: 'something went wrong'
        })
    }
};

module.exports = (err, req, res, next) => {
    // console.log(err.message);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err, res);
    } else if(process.env.NODE_ENV === 'production'){
        let error = {...err};

        if(error.name === 'CastError') err = handleCastErrorDB(err);
        if(error.code === 11000) err = handleDuplicateFieldDB(err);
        if(error.name === 'Validation Error') err = handleValidationErrorDB(err);
        if(error.name === 'JsonWebTokenError')  err = handleJWTError(err);
        if(err.name === 'TokenExpiredError') err= handleJWTExpireError(err);

        sendErrorProd(err, res);
    }
};