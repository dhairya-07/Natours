const Tours = require('../models/tourModel');
const APIFeatures = require('../utils/APIFeatures');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.aliasTopTours = catchAsync(async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,duration,difficulty,summary';
  next();
});

exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tours.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;
  return res.status(200).json({ msg: 'Success', result: tours.length, tours });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tours.create(req.body);

  return res.status(200).json({ msg: 'Success', new_tour: newTour });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tours.findById(req.params.id);
  if (!tour) {
    return next(new AppError('No tour found with this ID', 404));
  }
  return res.status(200).json({ msg: 'Success', tour });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tours.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('No tour found with this ID', 404));
  }
  return res.status(200).json({ status: 'Success', tour });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tours.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('No tour found with this ID', 404));
  }
  return res.status(200).json({ msg: 'Tour deleted' });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tours.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRatings: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgRatings: -1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);
  return res.status(200).json({ status: 'Success', stats });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tours.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTours: -1 },
    },
  ]);
  return res.status(200).json({ status: 'Success', plan });
});
