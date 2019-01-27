
var env = process.env.NODE_ENV || 'development'
if(env === 'development'){
    process.env.PORT = 2000
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp'
    console.log('MongoDB uri : ',process.env.MONGODB_URI )
}
else if(env === 'test'){
    process.env.PORT = 3000
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TestTodoApp'
}