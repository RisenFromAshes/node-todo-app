const {ObjectID} = require('mongodb')
const {User} = require('../../models/user')
const {Todo} = require('../../models/todo')
const jwt = require('jsonwebtoken')

var userID1 = new ObjectID()
var userID2 = new ObjectID()

var id_1 = new ObjectID().toHexString()
var id_2 = new ObjectID().toHexString()

var todo_1 = {
        _id: id_1,
        text: 'Todo text 1',
        _creator: userID1

    },
    todo_2 = {
        _id: id_2,
        text: 'Todo text 2',
        completed: true,
        completedAt: 333,
        _creator: userID2   
    }

var user1 = {
    _id : userID1,
    email : 'user1@example.com',
    password : 'user1pass',
    tokens : [
        {
            access : 'auth',
            token : jwt.sign({_id : userID1, access : 'auth'}, '123abc').toString()
        }
    ]
}

var user2 = {
    _id : userID2,
    email : 'user2@example.com',
    password : 'user2pass',
    tokens : [
        {
            access : 'auth',
            token : jwt.sign({_id : userID2, access : 'auth'}, '123abc').toString()
        }
    ]
}

var populateTodosDB = function(done){
    this.timeout(4000)
    Todo.deleteMany({}).then(() => {
        Todo.insertMany([todo_1, todo_2])
    }).then(() => done())
}

var populateTestUserDB = function(done){
    this.timeout(4000)
    User.deleteMany({}).then(() => {
        var user1promise = new User(user1).save()
        var user2promise = new User(user2).save()
        return Promise.all([user1promise, user2promise])
    }).then(() => done())    
}


module.exports = {id_1, id_2, todo_1, todo_2, user1, user2, populateTestUserDB, populateTodosDB}