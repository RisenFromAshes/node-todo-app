
var {MongoClient, ObjectID} = require('mongodb')
var express = require('express')

var client, db

var connect = (dbName, collectionName)=>{
    MongoClient.connect('mongodb://localhost:27017/' + dbName, {
        useNewUrlParser: true
    })
        .then(_client => {
            console.log('Successfully connected to the database')
            client = _client
            db = client.db().collection(collectionName)                
        }).catch(err => {
            console.log('An error has occured trying to connect')
        })
}

var connecttoDB = (dbName, collectionName) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect('mongodb://localhost:27017/' + dbName, {
            useNewUrlParser: true
        })
            .then(client => {
                console.log('Successfully connected to the database')
                var db = client.db().collection(collectionName)
                resolve(db)
            }).catch(err => {
                console.log('An error has occured trying to connect')
                reject(err)
            })
    })        
}

var getTodos = (callback)=>{
    var docs = []
    var cursor = db.find()
    cursor.forEach((doc) => {
        docs.push(doc)
    }, () => {
        callback(docs)
    })    
}

var postTodo = (todo, callback) => {
    db.insertOne(todo).then(res => {
        callback(res.ops[0])
    })
}

var modifyTodo = (todo, callback) =>{
    var query = {_id : new ObjectID(todo._id)}
    var update = { $set : { completed : todo.completed, text : todo.text}}
    db.findOneAndUpdate(query,update,{returnOriginal: false}).then(res=>{
        callback(res.value)
    })
}

var deleteCompletedTodos = (callback) => {
    db.deleteMany({completed : true}).then(res=>{
        console.log(res.result.n)
        callback(res.result.n)
    }).catch((err)=>{
        console.log(err)
    })
}

module.exports = {
    connect,
    getTodos,
    postTodo,
    modifyTodo,
    deleteCompletedTodos
}



