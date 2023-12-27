const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

//const io = require('socket.io')(3000)

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  //useCreateIndex: true,
  //useFindAndModify: false,
};

mongoose.connect('mongodb+srv://deepakanto212:*****@cluster0.cgdzxan.mongodb.net/?retryWrites=true&w=majority', mongooseOptions)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error.message);
  });

  const messageSchema = new mongoose.Schema({
  name: String,
  message: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model('Message', messageSchema);
const users = {}

io.on('connection', socket => {
  socket.on('new-user', name => {
    users[socket.id] = name
    socket.broadcast.emit('user-connected', name)
  })
  socket.on('send-chat-message', async (message) => {

    const userName = users[socket.id];
    const newMessage = new Message({ name: userName, message });
    await newMessage.save();
    socket.broadcast.emit('chat-message', { message: message, name: users[socket.id] })
  })
  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id])
    delete users[socket.id]
  })
})

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});