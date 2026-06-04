import dns from 'dns';
import mongoose from 'mongoose';

const DEFAULT_DNS = ['1.1.1.1', '8.8.8.8'];

export function configureDns() {
  try {

    const servers = process.env.DNS_SERVERS
      ? process.env.DNS_SERVERS
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      : DEFAULT_DNS;

    dns.setServers(servers);

    console.log('DNS Servers:', servers);

    return servers;

  } catch (error) {
    console.error('DNS Configuration Error:', error.message);
    return DEFAULT_DNS;
  }
}

export async function connectDatabase(uri) {

  try {

    configureDns();

    mongoose.set('strictQuery', true);

    const connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4
    });

    console.log(`MongoDB Connected: ${connection.connection.host}`);
    console.log(`MongoDB Database Name: ${connection.connection.name}`);

    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('Mongoose disconnected');
    });

    return connection;

  } catch (error) {

    console.error('Database Connection Failed:', error.message);

    process.exit(1);
  }
}