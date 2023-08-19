const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Users = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/email');

function filterObj(obj, ...allowedFields) {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
}

const signJWT = (id) => {
  const token = jwt.sign(id, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};

const createSendToken = (user, statusCode, res) => {
  const token = signJWT({ id: user._id });

  const cookieOptions = {
    expiresIn: process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    httpOnly: true,
  };

  if (process.env.NODE_ENV.trim() === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  return res.status(statusCode).json({
    status: 'Sucess',
    token,
    user,
  });
};

const signup = catchAsync(async (req, res, next) => {
  const newUser = await Users.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  createSendToken(newUser, 201, res);
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Please provide an email and password', 400));

  const user = await Users.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Invalid email or password', 401));

  createSendToken(user, 200, res);
});

const protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token)
    return next(
      new AppError('You are not logged in. Please log in to get access', 401),
    );

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await Users.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError('User belonging to this token no longer exists.', 401),
    );
  if (currentUser.changedPasswordAfter(decoded.iat))
    return next(
      new AppError('User recently changed password. Please login again', 401),
    );

  req.user = currentUser;
  next();
});

// eslint-disable-next-line arrow-body-style
const restrictTo = (...roles) => {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }
    next();
  };
};

const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await Users.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('No user with this email found', 404));
  }

  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/reset-password/${resetToken}`;

  const message = `Forgot your password? Make a patch request with your new password and passwordConfirm to ${resetURL}. If you didn't forget your password, please ignore this email`;

  const subject = 'Your password reset token (Valid for only 10 mins)';

  try {
    await sendEmail({
      email: user.email,
      subject,
      message,
    });
    createSendToken(user, 200, res);
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;

    return next(
      new AppError(
        'There was a error sending the email. Please try again later',
        500,
      ),
    );
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await Users.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next('Token is invalid or expired', 400);
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

const updatePassword = catchAsync(async (req, res, next) => {
  const user = await Users.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Wrong password! Please try again', 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.save();

  createSendToken(user, 200, res);
});

const updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password update. Please hit /update-password for that',
        401,
      ),
    );
  }

  const filteredObj = filterObj(req.body, 'name', 'email');

  const updatedUser = await Users.findByIdAndUpdate(req.user.id, filteredObj, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({ status: 'Success', user: updatedUser });
});

const deleteMe = catchAsync(async (req, res, next) => {
  await Users.findByIdAndUpdate(req.user.id, { active: false });
  return res.status(204).json({});
});

module.exports = {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateMe,
  deleteMe,
};
