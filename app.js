const express = require('express')
const MongoClient = require('mongodb').MongoClient
const app = express()
const bodyParser = require('body-parser')

// Middleware
app.use(bodyParser.json({
  limit: '20mb'
}))
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '20mb'
}))

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

// Connection URL
const url = 'mongodb://localhost:27017';
const dbName = 'cinestat';
const collectionName = 'entries'

// Routes
app.get('/', (req, res) => res.send('Cinestat Backend'))
app.post('/stats', (req, res) => {
  MongoClient.connect(url)
    .then((db) => {
      const dbo = db.db(dbName)
      dbo.collection(collectionName).insertOne({
        name: req.body.name,
        movies: Object.values(req.body.movies) // ensure array, not numeric-keyed object
      }).then((entry) => {
        res.send({
          id: entry.insertedId
        })
      })
    })
    .catch((err) => {
      console.log(err)
    })
})
app.get('/stats/:id', function (req, res) {
  const ObjectId = require('mongodb').ObjectId
  const id = new ObjectId(req.params.id)
  MongoClient.connect(url)
    .then((db) => {
      const dbo = db.db(dbName)
      dbo.collection(collectionName).findOne({
        _id: id
      }).then((result) => {
        if (result) {
          res.send(result)
        } else {
          res.status(404)
          res.send('')
        }
      })
    })
})

app.listen(3001)