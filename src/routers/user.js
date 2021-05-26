const express = require('express')
const router = express.Router()
const upload = require('../middleware/multer')
const auth = require('../middleware/auth')
const { deleteAvatar, getAvatar, uploadAvatar, postUser, loginUser, validateToken, deleteUser, patchUser, userMe } = require('../controllers/user')

//Multer config
router.route('/users/me/avatar')
  .post(auth, upload.single('avatar'), uploadAvatar)
  .delete(auth, deleteAvatar)

router.route('/users/:id/avatar')
  .get(getAvatar)

router.route('/users')
  .post(postUser)

router.route('/users/login')
  .post(loginUser)

router.route('/users/token/validate')
  .get(validateToken)

router.route('/users/me')
  .get(auth, userMe)
  .delete(auth, deleteUser)
  .patch(auth, patchUser)

module.exports = router