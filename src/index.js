
const path = require('path')
const http = require('http')
const express = require('express');
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser, getUser, removeUser, getUsersInRoom} = require('./utils/users')

const app = express();
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, '../public')));
//const viewPath = path.join(__dirname, '../public');


io.on('connection', (socket)=>{ 

    socket.on('join', (options, callback)=>{
        const {error, user} = addUser({id: socket.id, ...options})
         
        if(error){
            return callback(error)
        }
  
        socket.join(user.room)
     
        socket.emit('message', generateMessage('Admin', 'Welcome!!!') )
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username}  has joined`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (message, cb)=>{
        const user = getUser(socket.id)
        if(user){
            const filter = new Filter()

            if(filter.isProfane(message)){
                return cb('Profanity is not allowed ')
            } 

            io.to(user.room).emit('message', generateMessage(user.username, message))
            cb('')
        } 
         
    })

    socket.on('sendLocation', (coords, cb)=>{
        const user = getUser(socket.id)
        if(user){
             io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`) )
        cb() 
        }
      
    })

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)

        if(user){
             io.to(user.room).emit('message', generateMessage( 'Admin',`${user.username} has left!`)) 
             io.to(user.room).emit('roomData', {
                 room: user.room,
                 users: getUsersInRoom(user.room)
             })
        }     
    })  
})

app.get('/', (req, res)=>{
    res.render('index')
})

server.listen(port, ()=>{console.log('...listen port '+ port + '...');})