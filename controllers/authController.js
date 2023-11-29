const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// This creates the token specific to each user using the user id and the secret
const singToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: `${process.env.JWT_EXPIRES_IN}`,
  });

exports.singup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  const token = singToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token: token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // CHECK IF THE PROVIDED EMAIL AND PASSWORD EXIST
  if (!email || !password) {
    return next(new AppError('Please provide a email and password', 400));
  }

  // CHECK IF THE USER EXISTS AND THE PASSWORD MATCHES

  // this finds the user by filtering the email field and explicitly sets the password field to be shown in the output
  const user = await User.findOne({ email: email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // SEND BACK TOKEN
  const token = singToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) getting token and checking if its there

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError(
        'You are not logged in. Please log in to access this resource',
        401,
      ),
    );
  }
  // 2) validate token

  // Carrying out validation of the token received using the verify method from jwt library.
  // Promisify is used so that a promise is returned, which is easily handled
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // Any token validation errors will be catched by the catchAsync function which will then trigger the global error middleware to deal with the error

  // decoded constains the payload(in our case the user id), what time the token was created and at what time it will expire

  // 3) check if user still exists and if not do not allow access

  const userTest = await User.findById(decoded.id);
  if (!userTest) {
    return next(
      new AppError('The user belonging to this token does not exist', 401),
    );
  }

  // 4) check if user changed passwrod after the token was issued if so deny access
  if (userTest.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'The password was changed recently. Please log in again.',
        401,
      ),
    );
  }

  // IF this point is reached it means access is granted to the user
  req.user = userTest;
  next();
});
