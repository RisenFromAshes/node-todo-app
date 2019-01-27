
const expect = require('expect')
const request = require('supertest')
const rewire = require('rewire')

var {app} = rewire('../app')

const {ObjectID} = require('mongodb')

var {Todo} = require('../models/todo')

var {id_1, id_2, todo_1, todo_2, user1, user2, populateTestUserDB, populateTodosDB} = require('./seed/seed')

var {User} = require('../models/user')



before(populateTodosDB)
before(populateTestUserDB)



describe('testing app.js todos',()=>{
    

    describe('GET /todos',()=>{

        it('should reject if unauthenticated',function(done){
            this.timeout(4000)
            request(app)
                .get('/todos')
                .expect(401)
                .end(done)
                           
        })

        it('should accept if authenticated', function(done){
            this.timeout(4000)
            request(app)
                .get('/todos')
                .set('x-auth',user2.tokens[0].token)
                .expect(200)
                .expect(res => {
                    expect(res.body.todos[0].text).toBe(todo_2.text)
                    expect(res.body.todos[0]._id).toBe(id_2)
                    expect(res.body.todos[0].completed).toBe(true)
                    expect(res.body.todos[0].completedAt).toBe(todo_2.completedAt)
                    expect(res.body.todos.length).toBe(1)
                })
                .end((err,res)=>{
                    if(err) return done(err)
                    Todo.deleteMany({}).then(()=>{
                        done()
                    }).catch(err=>{
                        done(err)
                    })
                }) 
        })
    })

    describe('POST /todos', () => {

        it('should reject if unauthenticated',function(done){
            this.timeout(4000)
            request(app)
                .post('/todos')
                .expect(401)
                .end(done)
                           
        })

        it('should reject empty todo', function (done) {
            this.timeout(4000)
            request(app)
                .post('/todos')
                .set('x-auth',user1.tokens[0].token)
                .send({})
                .expect(400)
                .end(done)
        })

        it('should add a proper todo', function (done) {
            this.timeout(4000)
            var text = 'This is a todo'

            request(app)
                .post('/todos')
                .send({
                    text
                })
                .set('x-auth',user1.tokens[0].token)
                .expect(200)
                .expect(res => {
                    expect(res.body.todo.text).toBe('This is a todo')
                })
                .end((err) => {
                    if (err) return done(err)
                    Todo.countDocuments().then(res => {
                        expect(res).toBe(1)
                        done()
                    })
                })
        })

    })
    

    describe('PATCH /todos',()=>{

        it('should reject if unauthenticated',function(done){
            this.timeout(4000)
            request(app)
                .patch('/todos/123')
                .expect(401)
                .end(done)
                           
        })
        it('should reject if id is not provided',function(done){
            this.timeout(4000)
            request(app)
                .patch('/todos/')
                .set('x-auth',user1.tokens[0].token)
                .expect(404)
                .end(done)
                           
        })

        it('should reject an invalid id',function(done){
            this.timeout(4000)
            request(app)
                .patch('/todos/124adb')
                .set('x-auth',user1.tokens[0].token)
                .expect(404)
                .end(done)
        })

        it('should reject a unused id',function(done){
            this.timeout(4000)
            request(app)
                .patch('/todos/' + todo_2._id)
                .set('x-auth',user1.tokens[0].token)
                .expect(404)
                .end(done)
        })

        it('should patch a todo with a proper id', function(done){
            this.timeout(4000)
            Todo.deleteMany({}).then(()=>{
                Todo.insertMany([todo_1])
            }).then(()=>{
                request(app)
                    .patch(`/todos/${id_1}`)
                    .set('x-auth',user1.tokens[0].token)
                    .send({
                        text: 'Something new',
                        completed : true
                    })
                    .expect(200)
                    .expect(res=>{
                        expect(res.body.todo.text).toBe('Something new')
                        expect(res.body.todo.completed).toBe(true)
                    })
                    .end((err,res)=>{
                        if(err) return done(err)
                        Todo.findOne({'_id':id_1}).then(doc=>{
                            expect(doc.text).toBe('Something new')
                            expect(doc.completed).toBe(true)
                            done()
                        }).catch(err => done(err))
                    })
            }).catch(err=>done(err))
        })

    })

    describe('DELETE /todos',()=>{

        it('should reject if unauthenticated',function(done){
            this.timeout(4000)
            request(app)
                .delete('/todos/123')
                .expect(401)
                .end(done)
                           
        })
        it('should reject if id is not provided',function(done){
            this.timeout(4000)
            request(app)
                .delete('/todos/')
                .set('x-auth',user1.tokens[0].token)
                .expect(404)
                .end(done)
                           
        })

        it('should reject an invalid id',function(done){
            this.timeout(4000)
            request(app)
                .delete('/todos/124adb')
                .set('x-auth',user1.tokens[0].token)
                .expect(404)
                .end(done)
        })

        it('should reject a unused id',function(done){
            this.timeout(4000)
            request(app)
                .delete('/todos/' + todo_2._id)
                .set('x-auth',user1.tokens[0].token)
                .expect(404)
                .end(done)
        })

        it('should delete a todo with a proper id', function (done) {
            this.timeout(4000)
            request(app)
                .delete(`/todos/${id_1}`)
                .set('x-auth', user1.tokens[0].token)
                .expect(200)
                .expect(res => {
                    expect(res.body.deleted._id).toBe(id_1)
                    expect(res.body.deleted.text).toBe('Something new')
                })
                .end((err) => {
                    if (err) return done(err)
                    Todo.findOne({'_id':id_1}).then(doc=>{
                        expect(doc).toBeNull()
                        done()
                    }).catch(err=>done(err))
                })
        })        

    })

})

describe('testing app.js users', ()=>{

    describe('GET /users/me', ()=>{
        it('should reject a request without authentication', (done)=>{
            request(app)
                .get('/users/me')
                .expect(401)
                .end(done)
        })
        it('should reject a request without valid authentication', (done)=>{
            request(app)
                .get('/users/me')
                .set('x-auth','123abssaf')
                .expect(401)
                .end(done)
        })
        it('should accept a request with valid authentication', (done)=>{
            request(app)
                .get('/users/me')
                .set('x-auth',user1.tokens[0].token)
                .expect(200)
                .expect(res=>{
                    expect(res.body._id).toBe(user1._id.toHexString())
                    expect(res.body.email).toBe(user1.email)
                })
                .end(done)
        })
    })
    
    describe('POST /users',()=>{
        it('should reject a request without valid email', (done)=>{
            var email = 'somemail', password = 'abc123'
            request(app)
                .post('/users')
                .send({email, password})
                .expect(400)
                .end((err,res)=>{
                    if(err) done(err)
                    expect(res.headers).not.toHaveProperty('x-auth')
                    done()
                })
        })
        it('should reject a request without valid password', (done)=>{
            var email = 'some@mail.com', password = 'abc12'
            request(app)
                .post('/users')
                .send({email, password})
                .expect(400)
                .end((err,res)=>{
                    if(err) done(err)
                    expect(res.headers).not.toHaveProperty('x-auth')
                    done()
                })
        })
        it('should accept a request with valid email and password', (done)=>{
            var email = 'some@mail.com', password = 'abc123'
            request(app)
                .post('/users')
                .send({email, password})
                .expect(200)
                .expect(res=>{
                    expect(res.body.email).toBe(email)
                })
                .end((err,res)=>{
                    if(err) done(err)
                    expect(res.headers).toHaveProperty('x-auth')
                    done()
                })
        })
    })

    describe('POST /users/login',()=>{
        it('should  reject when email is absent', done=>{
            request(app)
                .post('/users/login')
                .send({password : user2.password})
                .expect(400)
                .end((err,res)=>{
                    if(err) return done(err)
                    expect(res.headers).not.toHaveProperty('x-auth')
                    done()
                })
        })
        it('should reject when email is absent', done=>{
            request(app)
                .post('/users/login')
                .send({email : user1.email})
                .expect(400)
                .end((err,res)=>{
                    if(err) return done(err)
                    expect(res.headers).not.toHaveProperty('x-auth')
                    done()
                })
        })
        it('should reject when password is invalid', done=>{
            console.log(user1.email, user1.password)
            request(app)
                .post('/users/login')
                .send({email : user1.email ,password : user1.password + '1'})
                .expect(401)
                .end((err,res)=>{
                    if(err) return done(err)
                    expect(res.headers).not.toHaveProperty('x-auth')
                    done()
                })
        })
        it('should accept when password is valid', done=>{
            console.log(user1.email, user1.password)
            request(app)
                .post('/users/login')
                .send({email : user1.email ,password : user1.password})
                .expect(200)
                .end((err,res)=>{
                    if(err) return done(err)
                    expect(res.headers).toHaveProperty('x-auth')
                    done()
                })
        })
    })

    describe('DELETE /users/me/logout',()=>{
        it('should deny unauthorized requests',done=>{
            request(app)
                .delete('/users/me/logout')
                .expect(401)
                .end(done)
        })
        it('should accept authorized requests and delete token', function(done){
            this.timeout(4000)
            request(app)
                .delete('/users/me/logout')
                .set('x-auth', user1.tokens[0].token)
                .expect(200)
                .end((err,res)=>{
                    if(err) return done(err)
                    User.findOne({_id : user1._id}).then(user=>{
                        expect(user.tokens.length).toBe(0)
                        done()
                    }).catch(err=>{
                        done(err)
                    })
                })
        })
    })
})