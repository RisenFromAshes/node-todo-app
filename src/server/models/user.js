
const {mongoose} = require('../db/mongoose')
//const {ObjectID} = require('mongodb');

var validator = require('validator')
var bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken')

var UserSchema = new mongoose.Schema({
    email : {
        required : true,
        type : String,
        trim : true,
        minlength : 1,
        unique : true,
        validate : {
            validator : validator.isEmail,
            message : '{VALUE} is not a valid email'
        }
    },
    password : {
        required : true,
        type : String,
        minlength : 6
    },
    tokens : [
        {
            access : {
                type : String,
                required : true
            },
            token : {
                type : String,
                required : true
            }
        }
    ]
})


UserSchema.pre('save', function(next){
    var user = this

    if(user.isModified('password')){
        bcrypt.genSalt(10).then(salt =>{
            return bcrypt.hash(user.password,salt)
        }).then(hash => {
            user.password = hash
            next()
        }).catch(err => {
            console.log(err)
            next()
        })
    }
    else{
        next()
    }
})

UserSchema.methods.getAuthToken = function(){    
    var user = this
    var access = 'auth'

    var token = jwt.sign({_id : user._id.toHexString() , access}, process.env.JWT_SECRET).toString()

    user.tokens.push({access, token})

    return user.save().then(()=>{
        return token
    })
}

UserSchema.methods.deleteUserToken = function(token){
    var user = this
    
    var updateOperator = {
        $pull : {
            tokens : {token}
        }
    }

    return user.updateOne(updateOperator)
}

UserSchema.statics.getUserByToken = function (token){

    var decodedToken

    try{
        decodedToken = jwt.verify(token,process.env.JWT_SECRET)
    }catch(err){
        return Promise.reject()
    }

    return User.findOne({
        '_id' : decodedToken._id,
        'tokens.token' : token,
        'tokens.access' : 'auth'
    })

}

UserSchema.statics.getUserByCredentials = function(email, password){
    var User = this

    return User.findOne({email}).then(user=>{
        if(!user) return Promise.reject()
        return bcrypt.compare(password, user.password).then(verified=>{
            if(verified){
                return Promise.resolve(user)
            }
            else return Promise.reject()
        })
    })
}



var User = new mongoose.model('User', UserSchema)

module.exports = {User}