const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

// Checks if the id is valid if so the normal route is called, other wise an invalid request is sent
// router.param('id', userController.checkID);

// Order of the routes matters they must be carefully placed
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router.route('/tours-stats').get(tourController.getTourStats);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
