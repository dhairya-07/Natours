const { Schema, model } = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const validator = require('validator');

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowecase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
  },
  photo: String,
});

const Users = model('User', userSchema);

module.exports = Users;
