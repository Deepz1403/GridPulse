import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authroutes.js';
import attendantRoutes from './routes/attendantroutes.js';
import session from 'express-session';
import powerDataRoutes from './routes/powerdataroutes.js';
import managerRoutes from './routes/manageroutes.js';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const httpServer = createServer(app);

// Define allowed origins
const allowedOrigins = [
  'http://localhost:5173',
];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// MongoDB Change Stream Setup
const setupChangeStream = () => {
  const db = mongoose.connection;
  const collection = db.collection('ss-4'); // Match your collection name
  
  const changeStream = collection.watch([], {
    fullDocument: 'updateLookup'
  });

  changeStream.on('change', (change) => {
    if (change.operationType === 'insert' || change.operationType === 'update'||change.operationType === 'delete') {
      io.emit('data_update', change.fullDocument);
    }
  });

  changeStream.on('error', (error) => {
    console.error('Change stream error:', error);
  });
};

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    setupChangeStream();
  })
  .catch(err => console.log(err));

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
  credentials: true
}));

app.use(express.json());
app.use(express.static('public'));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // Required for cross-origin in production
  }
}));

// Routes
app.use('/', authRoutes);
app.use('/attendant', attendantRoutes);
app.use('/power', powerDataRoutes);
app.use('/manager', managerRoutes);

// WebSocket connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
