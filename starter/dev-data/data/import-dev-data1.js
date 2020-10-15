const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');
const Tour = require('../../../models/tourModel');

// LOCAL DB CONNECTION
const DB = process.env.DATABASE.replace(
    '<password>',
    process.env.DATABASE_PASSWORD
);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true

    })
    .then(() => console.log('DB connection successfull!!'));

//Read JSON File
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

// Import data to DB
const importData = async () => {
    try {
        await Tour.create(tours);
        console.log('Data loaded into DB successfully');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

//Delete all data from DB

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('Data deleted successfully');
        process.exit();
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

console.log(process.argv);

if (process.argv[2] === '---import') {
    importData()
} else if (process.argv[2] === '---delete') {
    deleteData();
}
