const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

function checkId(req, res, next, val) {
  if (val > tours.length) return res.status(400).json({ err: 'Invalid ID' });
  next();
}

function getAllTours(req, res) {
  return res
    .status(200)
    .json({ msg: 'Success', no_of_tours: tours.length, tours });
}

function createTour(req, res) {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err) console.log(err);
    }
  );

  return res
    .status(200)
    .json({ msg: 'Success', no_of_tours: tours.length, new_tour: newTour });
}

function getTour(req, res) {
  const id = req.params.id * 1;

  const tour = tours.find((tour) => tour.id === id);

  return res.status(200).json({ msg: 'Success', tour });
}

function updateTour(req, res) {
  return res.status(200).json({ msg: 'Will implement this end-point' });
}

function deleteTour(req, res) {
  return res.status(200).json({ msg: 'Will implement this end-point' });
}

module.exports = {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  checkId,
};
