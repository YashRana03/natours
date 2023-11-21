//const { express } = require('express');
const Tour = require('../models/tourModel');

exports.getAllTours = async (req, res) => {
  // This removes any of the special operation keywords: page, sort, limit, fields form the query object
  try {
    const queryObj = { ...req.query };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((element) => {
      delete queryObj[element];
    });

    // FILTERING
    // Use regex to look for gte,gt,lt,lte operators and add a $ at the start
    const stringQuery = JSON.stringify(queryObj).replace(
      /\b(gte|lte|gt|lt)\b/g,
      (match) => `$${match}`,
    );

    let query = Tour.find(JSON.parse(stringQuery));

    // Another way of filtering
    // const tours = await Tour.find()
    //   .where(attribute1)
    //   .eqauls(5)
    //   .where(attribute2)
    //   .equals(2);

    // SORTING
    if (req.query.sort) {
      // You can sort in mongoose by using query.sort("field1 field2") this will autmotically order the data in ascending order by considering field1 in the data and if it matches in multiple data points than field2 is considered
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-ratingsAverage');
    }

    // LIMITING

    // Allows the api user to chose which fields to include in the returned data
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else query = query.select('-__v'); // This removes the __v field from the data sent to the user

    // PAGING
    //Allows the user to specify page number and how many data points should be displayed on each page
    const page = req.query.page * 1 || 1; // The || sets the default value of the variable if the user doesnt give one
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    if (req.query.page) {
      const numberOfDocs = await Tour.countDocuments();
      // If the user requests a page that is outside the range of our database values an error is thrown
      // This will take us straight to the catch block since all this code is in a try block
      if (skip >= numberOfDocs) throw new Error('This page does not exist');
    }
    query = query.skip(skip).limit(limit);

    const tours = await query;

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

// We are not actually carrying out the delete operation...

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    console.log(newTour);
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
