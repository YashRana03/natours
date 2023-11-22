const mongoose = require('mongoose');
// eslint-disable-next-line node/no-unpublished-require, import/no-extraneous-dependencies
const slugify = require('slugify');

const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, 'A tour must have a name'],
    },
    slug: String,

    secret: Boolean,

    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },

    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },

    priceDiscount: Number,

    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour musthave a description'],
    },

    description: {
      type: String,
      trim: true,
    },

    imageCover: {
      type: String,
      reqired: [true, 'A tour must have a cover image'],
    },

    images: [String],

    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },

    startDates: [Date],
  },
  // Following object tells the virtual fields to be included in the JSON data and object formats
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Creating a virtual field which is not acutally present in the database, but only gets created when the data is requested. Virtual fields cannot be however used in queries to filter for a document
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//-------------------------------------------------------------------------------------------------------------------
//DOCUMENT MIDDLEWARE runs before and after a document is saved

// tourSchema.pre('save', function (next) {
//   // Runs before the .save() and .create() mongoose methods (before the document is saved)

//   this.slug = slugify(this.name, { lower: true }); // The this. refers to the current document that will be saved
//   next();
// });

// .post runs after the document has been saved

// tourSchema.post('save', function ( doc, next) { // It has acess to the document saved
//   console.log(doc);
//   next();
// });

//-------------------------------------------------------------------------------------------------------------------
// QUERY MIDDLEWARE: allows to run functions before and after a query is executed

// This middleware function is executed before the query is resolved. The function is triggered by any of the mongoose method that start with "find"

tourSchema.pre(/^find/, function (next) {
  // Filtering out all the secret documents
  this.find({ secret: { $ne: true } });
  this.start = Date.now();
  next();
});

// This middleware function is executed after the query has been resolved by any of the methods starting with find
tourSchema.post(/^find/, function (docs, next) {
  // It has access to all the documents returned by the query
  //console.log(docs);
  console.log(
    `Total time it took to resolve query is: ${
      Date.now() - this.start
    } milliseconds`,
  );
  next();
});

//-------------------------------------------------------------------------------------------------------------------
// AGGREGATION MIDDLEWARE: allows to run functions before and after an aggregation is executed

// This is executed before the aggregate() function
tourSchema.pre('aggregate', function (next) {
  // The this gives access to the aggreagete object in the function. using the pipeline the array containing the stages can be accessed

  // adding to the start of the pipeline array a new match stage to filter out any tour which is secret
  this.pipeline().unshift({ $match: { secret: { $ne: true } } });
  //console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
