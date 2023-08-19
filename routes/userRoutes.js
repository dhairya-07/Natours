const { Router } = require('express');
const {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateMe,
  deleteMe,
} = require('../controllers/authController');
// const authController = require('../controllers/authController');
const { getAllUsers, deleteUser } = require('../controllers/userController');

const router = Router();

router.post('/signup', signup);
router.post('/login', login);

router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

router.get('/', getAllUsers);

router.patch('/update-password', protect, updatePassword);
router.patch('/updateMe', protect, updateMe);

router.delete('/deleteMe', protect, deleteMe);

router.delete('/:id', protect, restrictTo('admin', 'lead-guide'), deleteUser);

module.exports = router;
