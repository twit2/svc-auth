import { configDotenv } from 'dotenv';
import express, { Request, Response } from 'express';
import mongoose, { Mongoose } from 'mongoose';
import { CredentialModel } from './models/CredentialModel';
import { createClient } from 'redis';
import { handleLogin } from './routes/Login';
import { handleRegister } from './routes/Register';
import { handleVerify } from './routes/Verify';
import { body } from 'express-validator';
import { Limits } from '@twit2/std-library';

// Load ENV parameters
configDotenv();

// Setup
// ------------------------------------------------
const app = express();
const port = process.env.HTTP_PORT || 3000;

let redisClient = createClient({
    url: process.env.REDIS_URL,
});

app.use(express.json());

// Validators
// ------------------------------------------------

const usernameValidator = ()=>body('username')
    .notEmpty()
    .isString()
    .isLength({ min: Limits.uam.username.min, max: Limits.uam.username.max });

const passwordValidator = ()=>body('password')
    .notEmpty()
    .isString()
    .isLength({ min: Limits.uam.password.min, max: Limits.uam.password.max });

// Routes
// ------------------------------------------------

app.post('/login', usernameValidator, passwordValidator, handleLogin);
app.post('/register', handleRegister);
app.post('/verify', handleVerify);

/**
 * Main entry point for program.
 */
async function main() {
    if(process.env.DB_URL == null) {
        console.error("No database URL defined - is your .env file correct?");
        return;
    }

    // Connect to database
    try {
        console.log(`Connecting to ${process.env.DB_URL}...`);
        await mongoose.connect(`${process.env.DB_URL}/${process.env.DB_NAME}`);
        console.log(`Connected to database.`);
    } catch(e) {
        console.error("Cannot connect to database server.");
        return;
    }

    // Connect to redis
    // try {
    //     console.log(`Connecting to redis...`);
    //     redisClient.once("error", (error) => console.error(`Error : ${error}`));
    //     await redisClient.connect();
    // } catch(e) {
    //     console.error("Cannot connect to the redis server.");
    //     return;
    // }

    // Init models
    await CredentialModel.init();

    // Listen at the port
    app.listen(port, () => {
        console.log(`Service active at port ${port}`);
    });
}

main()