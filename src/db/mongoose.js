const mongoose = require('mongoose')

async function connection() {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    })
  } catch (error) {
    console.log(error)
  }
}

module.exports = connection