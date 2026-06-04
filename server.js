import './config/loadEnv.js';

import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import http from 'http';
import { Server } from 'socket.io';

import { connectDatabase } from './config/database.js';
import privateChatSocket from './sockets/privateChat.socket.js';
import { SIGNS, generateHoroscope } from './data/horoscope.js';

import agoraRoutes from './routes/agoraRoutes.js';
import authRoutes from './routes/authRoutes.js';
import astrologerRoutes from './routes/astrologerRoutes.js';
import dropdownRoutes from './routes/dropdownRoutes.js';
import adminPlanetTransitRoutes from './routes/adminplanettransitRoutes.js';
import poojaRoutes from './routes/poojaRoutes.js';
import productRoutes from './routes/productRoutes.js';
import faqRoutes from './routes/faqRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import communicationRoutes from './routes/communicationRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import langRoutes from './routes/languageRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import otpRoutes from './routes/otpRoutes.js';
import moneyAddRoutes from './routes/moneyAddRoutes.js';
import astroFormRoutes from './routes/astroFormRoutes.js';
import astrologerApplication from './routes/astrologerApplication.js';
import astroRoutes from './routes/astroRoutes.js';
import privateChatRoutes from './routes/privateChat.routes.js';
import userDetailsRoutes from './routes/userDetailsRoutes.js';
import kundaliRoutes from './routes/kundaliRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import firebaseRoutes from './routes/firebase.routes.js';
import orderRoutes from './routes/orderRoutes.js';
import privacyPolicyRoutes from './routes/privacyPolicyRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import followRoutes from './routes/followRoutes.js';
import callRoutes from './routes/callRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import ratingReviewRoutes from './routes/ratingReviewRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

app.set('io', io);

privateChatSocket(io);

app.use(helmet());

app.use(compression());

app.use(morgan('dev'));

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json({
  limit: '10mb'
}));

app.use(express.urlencoded({
  extended: true,
  limit: '10mb'
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});

app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/astrologer', astrologerRoutes);
app.use('/api/dropdown', dropdownRoutes);
app.use('/api/kundali', kundaliRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api', poojaRoutes);
app.use('/api/product', productRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/agora', agoraRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/wallet-money', walletRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api', langRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/money', moneyAddRoutes);
app.use('/api/astro-form', astroFormRoutes);
app.use('/api/astrologers-new', astrologerApplication);
app.use('/api/astro', astroRoutes);
app.use('/api/privatechat', privateChatRoutes);
app.use('/api/userDetails', userDetailsRoutes);
app.use('/api/firebase', firebaseRoutes);
app.use('/api/order', orderRoutes);
app.use('/api', privacyPolicyRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/follower', followRoutes);
app.use('/api/call', callRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ratings', ratingReviewRoutes);
app.use('/api/adminplanettransit', adminPlanetTransitRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend Auto Deployed Successful by sumit'
  });
});

app.get('/horoscope/:sign/:period', (req, res) => {
  try {
    const { sign, period } = req.params;

    const lowerSign = sign.toLowerCase();
    const lowerPeriod = period.toLowerCase();

    if (!SIGNS.includes(lowerSign)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid zodiac sign'
      });
    }

    if (!['daily', 'weekly'].includes(lowerPeriod)) {
      return res.status(400).json({
        success: false,
        message: 'Period must be daily or weekly'
      });
    }

    return res.status(200).json({
      success: true,
      data: generateHoroscope(lowerSign, lowerPeriod)
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error('Request Error:', err);

  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message
  });
});

async function startServer() {
  try {

    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI is missing in .env');
    }

    await connectDatabase(mongoUri);

    console.log('MongoDB Connected Successfully');

    await import('./cron/walletCron.js');

    server.listen(PORT, () => {
      console.log(`Server running on PORT ${PORT}`);
    });

  } catch (error) {
    console.error('Server Startup Failed:', error.message);
    process.exit(1);
  }
}

const gracefulShutdown = async (signal) => {
  console.log(`${signal} received. Closing server...`);

  server.close(async () => {
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
      process.exit(0);
    } catch (error) {
      console.error('Shutdown Error:', error.message);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error('Force shutdown');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

startServer();