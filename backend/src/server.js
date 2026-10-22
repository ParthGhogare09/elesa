import http from 'http';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.IO for real-time live evaluations telemetry
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  socket.on('join_panel', (panelId) => {
    socket.join(`panel_${panelId}`);
  });

  socket.on('disconnect', () => {});
});

// Attach socket instance to app for controllers to emit live updates
app.set('io', io);

async function startServer() {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` PlacePro Evaluate Backend API running on port ${PORT}`);
    console.log(` Connected to MongoDB: ${process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placepro_evaluate'}`);
    console.log(` WebSocket Real-time Telemetry Enabled`);
    console.log(`====================================================`);
  });
}

startServer();
