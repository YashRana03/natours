class APIFEATURES {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // This removes any of the special operation keywords: page, sort, limit, fields form the query object
    const queryObj = { ...this.queryString };
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

    this.query = this.query.find(JSON.parse(stringQuery));
    return this;
  }

  sort() {
    // SORTING
    if (this.queryString.sort) {
      // You can sort in mongoose by using query.sort("field1 field2") this will autmotically order the data in ascending order by considering field1 in the data and if it matches in multiple data points than field2 is considered
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-ratingsAverage');
    }
    return this;
  }

  limitFields() {
    // LIMITING

    // Allows the api user to chose which fields to include in the returned data
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else this.query = this.query.select('-__v'); // This removes the __v field from the data sent to the user
    return this;
  }

  paginate() {
    // PAGINATING

    //Allows the user to specify page number and how many data points should be displayed on each page
    const page = this.queryString.page * 1 || 1; // The || sets the default value of the variable if the user doesnt give one
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFEATURES;
