const multer = require('multer')
const AppError = require('../utils/appError')

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new AppError('File must be an Image', 400))
    }
    cb(undefined, true)
  },
})

module.exports = upload
