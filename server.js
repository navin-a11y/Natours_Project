const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
    console.log('UNHANDLED Exception.... shutting down');
    console.log(err.name, err.message, err.stack);
        process.exit(1); // 0 for success and 1 for uncaughtException
});

dotenv.config({ path: './config.env' });
const app = require('./app');
const { path } = require('./app');

// mongodb+srv://Navin_2701:<password>@cluster0.d0wqh.mongodb.net/test?retryWrites=true&w=majority
let DB;

const isLocal = false;

if (isLocal) {
    // LOCAL DB CONNECTION
    DB = process.env.DATABASE_LOCAL;
} else {
    DB = process.env.DATABASE.replace(
        '<password>',
        process.env.DATABASE_PASSWORD
    );
}

if (DB) {
    mongoose
        //.connect(process.env.DATABASE, {
        .connect(DB, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        }).then(con => {
            console.log('DB connection successfull!!');
        }).catch(error => {
            console.log("ERROR: ", error);
        });
}
//schema
// under tourModel.js
//......................

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App is running on port ${port} - ${process.env.NODE_ENV}`);
});


//check with Niru for global unhandled rejection
process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION.... shutting down');
    console.log(err.name, err.message, err.stack);
    server.close(() => {
        process.exit(1); // 0 for success and 1 for uncaughtException
    });
});

// console.log(x);