
var mongoose = require('mongoose')
var mongodb = require('mongodb')

mongoose.Promise = global.Promise
console.log('Mongodb uri : ' + process.env.MONGODB_URI)
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false})



module.exports = { mongoose }