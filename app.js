const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const errorController = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1 MIDDLEWARES

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requstTime = new Date().toISOString();
  next();
});

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// This route catches all the routes that are not serverd by the server
app.all('*', (req, res, next) => {
  // When the next() function is called with an argument, express knows that an ererror has occured, thus it will go directly to the global error middleware skipping any other middlewares in the chain
  next(new AppError(`Cant'find the ${req.originalUrl} on this server.`, 404));
});

// GLOBAL ERROR handling middleware
app.use(errorController);

module.exports = app;
