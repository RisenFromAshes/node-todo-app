var {User} = require('../models/user')
var _ = require('lodash')

const {logger} =  require('./logger')

var authenticate = (req, res, next) => {

    Object.keys(req.route.methods).forEach(method=>{
        if(req.route.methods[method]) logger(`${method} ${req.route.path} request from ${req.connection.remoteAddress}`)
    })

    var token = req.header('x-auth') || req.query['access-token']
    //console.log(req.route.methods)
    if (!token) {
        logger(`Unauthorized request from ${req.connection.remoteAddress} rejected`)
        return res.sendStatus(401)
    }
    User.getUserByToken(token).then(user => {
        if (!user) return Promise.reject()
        req.user = user
        req.token = token
        logger(`Authorized request from ${req.connection.remoteAddress}, email: ${user.email} accepted`)
        next()
    }).catch(err => {
        logger(`Unauthorized request from ${req.connection.remoteAddress} rejected`)
        return res.sendStatus(401)
    })
}

module.exports = {authenticate}