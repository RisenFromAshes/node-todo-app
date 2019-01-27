
require('./config/config')

const express = require('express')
const {ObjectID} = require('mongodb')
const {Todo} = require('./models/todo')
const {User} = require('./models/user')
const {authenticate} = require('./middleware/authenticate')

const {logger} =  require('./middleware/logger')

var _ = require('lodash')
var path = require('path')
var bodyParser = require('body-parser')

var app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

app.use(express.static(__dirname))



app.get('/',(req,res)=>{
    res.status(200)
        .sendFile(path.join(__dirname, '../../','public/form.html'))
})

app.get('/todos',authenticate, (req, res)=>{    
    Todo.find({_creator : req.user._id}).then(todos=>{      
        res.status(200).json({todos})
    }).catch((err)=>{
        res.sendStatus(400)
    })
})

app.post('/todos', authenticate, (req,res)=>{
    
    if(req.body.text === ''|| !req.body.text) return res.sendStatus(400)
    var todo = new Todo({
        text : req.body.text,
        _creator : req.user._id
    })
    todo.save().then(doc=>{
        if(!doc) return res.sendStatus(400)
        res.status(200).json({todo: doc})
    }).catch(()=>{
        res.sendStatus(400)
    })
})

app.patch('/todos/:id', authenticate, (req,res)=>{
    
    if(!ObjectID.isValid(req.params.id)) return res.sendStatus(404)

    var updatedTodo = _.pick(req.body, ['text', 'completed'])

    if(req.body.completed) {
        updatedTodo.completed = true
        updatedTodo.completedAt = new Date().getTime()
    }

    var todoUpdate = {
        $set : updatedTodo
    }

    Todo.findOneAndUpdate({_id : req.params.id, _creator : req.user._id}, todoUpdate, {new : true}).then(doc=>{
        if(!doc) return res.sendStatus(404)
        res.status(200).json({todo:doc})
    }).catch(()=>{
        res.status(400).send()
    })
})

app.delete('/todos/:id', authenticate, (req,res)=>{

    if(!ObjectID.isValid(req.params.id)) return res.sendStatus(404)

    Todo.findOneAndDelete({_id : req.params.id, _creator : req.user._id}).then(doc=>{
        if(!doc) return res.sendStatus(404)
        res.status(200).json({ deleted: doc})
    }).catch(()=>{
        res.sendStatus(400)
    })
})

app.post('/users', (req,res)=>{
    if(!req.body || !req.body.email || !req.body.password) return res.sendStatus(400)
    
    var newUser = new User({
        email : req.body.email,
        password : req.body.password
    })

    newUser.save().then(user=>{
        if(!user) return Promise.reject()
        
        user.getAuthToken().then(token => {
            logger(`new user signup with email: ${user.email}`)
            res.header('x-auth', token).status(200).json(_.pick(user, ['_id','email']))
        })
    }).catch(err=>{
        logger(`user signup with email: ${req.body.email} failed`)
        res.sendStatus(400)
    })

})

app.post('/users/login', (req,res)=>{
    logger('post /users/login request from ' + req.connection.remoteAddress)
    if(!(req.body.email && req.body.password)){
        logger('user login failed')
        return res.sendStatus(400)
    }
    var this_user
    User.getUserByCredentials(req.body.email, req.body.password).then(user=>{
        this_user = user
        if(user.tokens.length===0) return user.getAuthToken()
        else return Promise.resolve(user.tokens[0].token)
    }).then(token=>{
        logger(`user logged in with email: ${this_user.email}`)
        res.status(200).header('x-auth', token).json(_.pick(this_user, ['_id', 'email']))
    }).catch(err=>{
        logger(`user login with email: ${req.body.email} failed`)
        res.sendStatus(401)
    })
})

app.get('/users/me', authenticate, (req,res)=>{
    res.status(200).json(_.pick(req.user,['_id','email']))
})

app.delete('/users/me/logout', authenticate, (req,res)=>{
    req.user.deleteUserToken(req.token).then(()=>{
        logger(`user logged out with email: ${req.user.email}`)
        res.sendStatus(200)
    }).catch(err=>{
        logger(`unauthorized user logout with email: ${req.user.email} failed`)
        res.sendStatus(401)
    })
})

app.listen(process.env.PORT,()=>{
    logger('Connected to port '+ process.env.PORT)
})

module.exports = {app}