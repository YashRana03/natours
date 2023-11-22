//const { express } = require('express');
const Tour = require('../models/tourModel');
const APIFEATURES = require('../utils/apiFeatures');

exports.getAllTours = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      results: 1,
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      error: 'Bad id Parameter',
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'Ivalid Id',
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

// The following code makes use of an aggregation pipeline. THis is a multistage process through which each docoument in the colleciton is passed. This allows data processing to be done on the data
exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
