const Users = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await Users.find();

  return res
    .status(200)
    .json({ status: 'Success', results: users.length, users });
});

const deleteUser = catchAsync(async (req, res, next) => {
  await Users.findByIdAndDelete(req.params.id);
  return res.status(200).json({ status: 'Success', msg: 'User deleted ' });
});

module.exports = { getAllUsers, deleteUser };
