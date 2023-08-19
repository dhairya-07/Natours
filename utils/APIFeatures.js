class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`,
    );
    this.query = this.query.find(JSON.parse(queryString));
    return this;
  }

  // Sorting
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // Field setting
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  // Pagination
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skipVal = (page - 1) * limit;
    this.query = this.query.skip(skipVal).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
