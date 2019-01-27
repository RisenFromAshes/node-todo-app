var {User} = require('../models/user')
var _ = require('lodash')

var authenticate = (req, res, next) => {
    var token = req.header('x-auth') || req.query['access-token']
    //console.log(req.route.methods)
    if (!token) return res.sendStatus(401)
    User.getUserByToken(token).then(user => {
        if (!user) return Promise.reject()
        req.user = user
        req.token = token
        next()
    }).catch(err => {
        return res.sendStatus(401)
    })
}

module.exports = {authenticate}