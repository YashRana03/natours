const express = require('express');
const userController = require('../controllers/tourController');

const router = express.Router();

// Checks if the id is valid if so the normal route is called, other wise an invalid request is sent
// router.param('id', userController.checkID);

router
  .route('/')
  .get(userController.getAllTours)
  .post(userController.createTour);
router
  .route('/:id')
  .get(userController.getTour)
  .patch(userController.updateTour)
  .delete(userController.deleteTour);

module.exports = router;
