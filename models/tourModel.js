const { Schema, model } = require('mongoose');

const tourSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      minLength: [8, 'Name must have atleast 8 characters'],
      maxLength: [20, 'Name cannot have more than 20 characters'],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be greater or equal to 1'],
      max: [5, 'Rating must be less or equal to 5'],
    },
    price: {
      type: Number,
      required: [true, ' A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val > this.price;
        },
        message: 'Discount price ({VALUE}) should be less than the price',
      },
    },
    duration: {
      type: Number,
      require: [true, 'A tour must have a duration'],
    },
    difficulty: {
      type: String,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty must either be: easy, medium or difficult',
      },
      required: [true, 'A tour must have a difficulty'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    summary: {
      type: String,
      required: [true, 'A tour must have a summary'],
      trim: true,
    },
    description: { type: String, trim: true },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: { type: [String] },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Tour = model('Tour', tourSchema);

module.exports = Tour;
