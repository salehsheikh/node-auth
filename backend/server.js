import express from 'express'
import authRoutes from './routes/authRoutes.js'
import profileRoutes from './routes/profileRoutes.js'
import postRoutes from './routes/postRoutes.js'
import connect from './config/db.js'
import dotenv from 'dotenv'
import cors from 'cors'
import './config/passportConfig.js';
import cookieParser from 'cookie-parser'
import passport from 'passport'
const app= express();
const port=5000;
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(passport.initialize());
dotenv.config();
app.use(cookieParser());
connect()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });
  app.use('/api/auth', authRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/posts',postRoutes);
  app.get("/", (req, res) => {
  res.status(200).json("HOME GET REQUEST");
});