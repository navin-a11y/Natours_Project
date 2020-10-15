//const fs = require("fs");
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.aliasTopTours = (req, res, next) => {
    req.query.limit ='5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

exports.getAllTours = catchAsync(async (req, res,next) => {
        //execute the query  
        const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
        const tours = await features.query;

        // Another Way
        // const query = Tour.find()
        // .where('duration').equals(5)
        // .where('difficulty').equals('easy');

        // Send Response  
        res.status(200).json({
        status : 'success', 
        results : tours.length,
        data : {
            tours
        }
    });
});

exports.getTour = catchAsync(async (req, res,next) => {
       const tour = await (await Tour.findById(req.params.id)).populate('reviews');
        // tour.findOne({ _id: req.params.id })

        if(!tour) {
            return next(new AppError('No tour found with that ID', 404))
        }

       res.status(200).json({
        status : 'success',
        data : {
            tour
        }
    });
});

exports.createTour = catchAsync(async(req, res, next) => {
    const newTour = await Tour.create(req.body)

    res.status(201).json({
        status : 'success',
        data : {
            tour: newTour
        }
    });
 });


exports.updateTour = catchAsync(async(req, res,next) => {
        //used in PATCH method
        const tour = await Tour.findByIdAndUpdate({_id: req.params.id}, req.body, {
            new: true,
            runValidators: true
        });

        if(!tour) {
            return next(new AppError('No tour found with that ID', 404))
        }

        res.status(200).json({
            status : 'Success',
            data : {
                tour: tour
            }
        });
});

exports.deleteTour = catchAsync(async(req, res,next) => { 
        const tour = await Tour.findByIdAndDelete({_id: req.params.id});
        
        if(!tour) {
            return next(new AppError('No tour found with that ID', 404))
        }

        res.status(204).json({
            status : 'Success',
            data : null
        });
});

exports.getTourStats = catchAsync(async(req, res,next) => {

        const stats = await Tour.aggregate([
            {
                $match : { 
                    ratingsAverage: { $gte: 4.5 }
                }
            },

            {
                $group : {
                    // _id: null
                    _id: { $toUpper: '$difficulty'},
                    //_id: '$ratingsAverage',
                    numTours: { $sum: 1},
                    numRatings: { $sum: '$ratingsQuantity'},
                    avgRating: { $avg: '$ratingsAverage'},
                    avgPrice: { $avg: '$price'},
                    minPrice: { $min : '$price'},
                    maxPrice: { $max: '$price'}
                }
            },
            {
                $sort: { avgPrice : 1}
            },
            // We also can repeat stages 
            // {
            //     $match: { _id: { $ne: 'EASY'}}
            // }
        ]);
        res.status(200).json({
            status : 'Success',
            data : {
                stats
            }
        });
});

exports.getMonthlyPlan = catchAsync(async(req,res,next) => {
        const year = req.params.year * 1; //2021

        const plan = await Tour.aggregate([
           {
            $unwind: '$startDates'
           },
           {
               $match: { 
                   startDates: {
                       $gte: new Date(`${year}-01-01`),
                       $lte: new Date(`${year}-12-31`)
                   }
               }
           },
           {
               $group: {
                   _id: { $month: '$startDates'},
                   numTourStarts: { $sum: 1 },
                   tours: { $push: '$name'}
               }
           },
           {
               $addFields: { month: '$_id'}
           },
           {
               $project: {
                   _id: 0 // Id will not be more longer
               }
           },
           {
               $sort: { numTourStarts: -1 } //-1 for decending order
           },
           {
               $limit: 12 // as a refernce            
           }
         ]);

            res.status(200).json({
                status : 'Success',
                data : {
                    plan
                }
            });
});