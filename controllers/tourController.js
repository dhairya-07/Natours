const Tours = require('../models/tourSchema');
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

module.exports = {
  aliasTopTours,
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
};
