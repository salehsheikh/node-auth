import express from 'express';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import postRoutes from './routes/postRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import followRoutes from './routes/followRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js'
import connect from './config/db.js';
import dotenv from 'dotenv';
import cors from 'cors';
import './config/passportConfig.js';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { createCheckoutSession, stripeWebhook, verifySubscription } from './controllers/subscriptionController.js';
import { protect } from './middleware/authMiddleware.js';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;

// Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(cookieParser());

// Attach io globally
app.set('io', io);


io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/notifications',notificationRoutes)

// Stripe Routes
app.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);
app.post("/api/stripe/create-checkout-session", createCheckoutSession);
app.post("/api/stripe/verify-subscription", protect, verifySubscription);

// Default Route
app.get("/", (req, res) => {
  res.status(200).json("HOME GET REQUEST");
});

connect()
  .then(() => {
    server.listen(port, () => {
      console.log(` Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error(" Failed to connect to MongoDB", err);
  });
