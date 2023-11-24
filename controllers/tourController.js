//const { express } = require('express');
const Tour = require('../models/tourModel');
const APIFEATURES = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllTours = catchAsync(async (req, res) => {
  // This creates the APIFEATURES object with a new query(Tour.find()) and the query paramaters as arguments.
  // The api object is used to perform filtering, sorting, limiting and pagination
  const features = new APIFEATURES(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError('No tour with such an ID', 404));
  }
  res.status(200).json({
    status: 'success',
    results: 1,
    data: {
      tour: tour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('No tour with such an ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('No tour with such an ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

// The following code makes use of an aggregation pipeline. THis is a multistage process through which each docoument in the colleciton is passed. This allows data processing to be done on the data
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    // There are many different stages such as: match, group, sort etc.

    // match only allows to the next stage in the pipeline the documents that follow the criteria specified
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },

    // the group stage creates different documents depending on the _id key. Therefore there will be a document for each type of difficulty. Furthermore, the accumulators declared will carry out specific tasks such as sum, average, etc... on the specified fields.
    {
      $group: {
        _id: '$difficulty',
        numRatings: { $sum: '$ratingsQuantity' },
        numTours: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },

    // The sort just puts the resulting documents from the previous stage in order using on of the fields in the documents such as avgPrice. Indeed now the documents do not have the original fields(i.e price) but only the ones delcared in the previous stage(i.e minPrice).
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      tour: stats,
    },
  });
});
