
var env = process.env.NODE_ENV || 'development'

if(env === 'development' || env === 'test'){
    var configJSON = require('./config.json');
    var config = configJSON[env]
    Object.keys(config).forEach(key=>{
        process.env[key] = config[key]
    })
}