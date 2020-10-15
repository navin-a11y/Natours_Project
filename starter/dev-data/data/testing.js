const express = require('express');
const fs = require("fs");

// ANKESH'S CHANGES
const bodyParser = require("body-parser");
const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));


const tours = JSON.parse(fs.readFileSync(`${__dirname}/starter/dev-data/data/tours-simple.json`, "utf-8"));

const getAllTours = (req, res) => {
    res.status(200).json({
        status : 'success',
        results : tours.length,
        data : {
            tours
        }
    });
};

const getTour = (req, res) => {
    console.log(req.body);
    const newId = tours[tours.length-1].id + 1;
    const newTour = Object.assign({id: newId}, req.body);
    // const _tours = Object
    // console.log(req.body);
    tours.push(newTour);
    
    fs.writeFile(
        `${__dirname}/starter/dev-data/data/tours-simple.json`, 
        JSON.stringify(tours), 
        err =>
        {
        res.status(201).json({
            status : 'success',
            data : {
                tour: tours
            }
        });
    });
}

const createTour = (req, res) => {
    console.log(req.body);
    const newId = tours[tours.length-1].id + 1;
    const newTour = Object.assign({id: newId}, req.body);
    // const _tours = Object
    // console.log(req.body);
    tours.push(newTour);
    
    fs.writeFile(
        `${__dirname}/starter/dev-data/data/tours-simple.json`, 
        JSON.stringify(tours), 
        err =>
        {
        res.status(201).json({
            status : 'success',
            data : {
                tour: tours
            }
        });
    });
}


const updateTour = (req, res) => {

    if(req.params.id *1 > tours.length){
        return res.status(404).json({
            status : 'Fail',
            message : 'Invalid ID'
        });
    } 

    res.status(200).json({
        status : 'Success',
        data : {
            tours : '<updated tour here>'
        }
    });
}

const deleteTour = (req, res) => {
    if(req.params.id *1 > tours.length){
        return res.status(404).json({
            status : 'Fail',
            message : 'Invalid ID'
        });
    } 

    res.status(204).json({
        status : 'Success',
        data : null
    });
}

//app.get('/api/v1/tours', getAllTours);
//app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour );
// app.delete('/api/v1/tours/:id', deleteTour);

app
.route('/api/v1/tours')
.get(getAllTours)
.post(createTour);

app
.route('/api/v1/tours/:id')
.get(getTour)
.patch(updateTour)
.delete(deleteTour);


const port = 3000;
app.listen(port, () => {
    console.log(`App is running on port ${port}...`);
});