const Tours = require('../models/tourModel');
const APIFeatures = require('../utils/APIFeatures');

async function aliasTopTours(req, res, next) {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,duration,difficulty,summary';
  next();
}

async function getAllTours(req, res) {
  try {
    const features = new APIFeatures(Tours.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;
    return res
      .status(200)
      .json({ msg: 'Success', result: tours.length, tours });
  } catch (error) {
    return res.status(400).json({ status: 'Failed', msg: error });
  }
}

async function createTour(req, res) {
  try {
    const newTour = await Tours.create(req.body);

    return res.status(200).json({ msg: 'Success', new_tour: newTour });
  } catch (error) {
    return res.status(400).json({
      status: 'Failed',
      msg: error,
    });
  }
}

async function getTour(req, res) {
  try {
    const tour = await Tours.findById(req.params.id);

    return res.status(200).json({ msg: 'Success', tour });
  } catch (error) {
    return res.status(400).json({ status: 'Failed', msg: error });
  }
}

async function updateTour(req, res) {
  const tour = await Tours.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  return res.status(200).json({ status: 'Success', tour });
}

async function deleteTour(req, res) {
  try {
    await Tours.findByIdAndDelete(req.params.id);
    return res.status(200).json({ msg: 'Tour deleted' });
  } catch (error) {
    return res.status(400).json({ status: 'Failed', msg: error });
  }
}

async function getTourStats(req, res) {
  try {
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
  } catch (err) {
    return res.status(400).json({ status: 'Fail', msg: err });
  }
}

async function getMonthlyPlan(req, res) {
  try {
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
  } catch (err) {
    return res.status(400).json({ status: 'Fail', msg: err });
  }
}

module.exports = {
  aliasTopTours,
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getTourStats,
  getMonthlyPlan,
};
