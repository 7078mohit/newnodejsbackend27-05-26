import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envPath = path.join(__dirname, '..', '.env');

const result = dotenv.config({
    path: envPath
});

if (result.error) {
    console.error('.env file not found');
    process.exit(1);
}

const requiredEnvVariables = [
    'PORT',
    'MONGODB_URI',
    'JWT_SECRET'
];

for (const key of requiredEnvVariables) {
    if (!process.env[key]) {
        console.error(`Missing required env variable: ${key}`);
        process.exit(1);
    }
}

console.log('.env loaded successfully');