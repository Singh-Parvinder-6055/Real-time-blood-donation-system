const express = require('express');
// const { createServer } = require('node:http');
const http=require("http");
const { join } = require('node:path');
const { Server } = require('socket.io');


const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
   
  socket.on("msg",(msg)=>{
    console.log(msg);
    socket.broadcast.emit("msgBack",msg);
    //  socket.emit("msg","welcome to the server");
    // socket.broadcast.emit("msg","welcome to the server");
    
  })
});

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, './client/index.html'));
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});