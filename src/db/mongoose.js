const mongoose = require('mongoose')

async function connection() {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    })
    console.log('Connected to the Mongo Cluster')
  } catch (error) {
    console.log(error)
  }
}

module.exports = connection
