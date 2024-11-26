import express from "express";
import path from 'path';
import { fileURLToPath } from "url";
import chatRoute from "./routes/chatRoute.js";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/', chatRoute);

const socketConnected = new Set();

io.on('connection', (socket) => {
    console.log(`Connection Established: ${socket.id}`);
    socketConnected.add(socket.id);

    // Broadcast total connected clients
    io.emit('clients-total', socketConnected.size);

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
        socketConnected.delete(socket.id);
        io.emit('clients-total', socketConnected.size);
    });

    // Broadcast messages to all clients
    socket.on('message', (data) => {
        console.log(data);
        io.emit('chatMessage', {...data, id:socket.id});
    });

    socket.on('feedback' , (data)=>{
        io.emit('feedback', data)
    })
});

const PORT = 4000;
httpServer.listen(PORT, () => {
    console.log(`Server Running on http://localhost:${PORT}`);
});
