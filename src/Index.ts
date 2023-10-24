import { configDotenv } from 'dotenv';
import express, { Request, Response } from 'express';
import mongoose, { Mongoose } from 'mongoose';
import cache from 'ts-cache-mongoose';
import { CredentialModel } from './models/CredentialModel';
import { createClient } from 'redis';
import { createCredential, createJwt, verifyCredential } from './CredMgr';

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

// Routes
// ------------------------------------------------
app.get('/', (req: Request, res: Response) => {
    res.send({ test: true });
});

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
    try {
        console.log(`Connecting to redis...`);
        redisClient.once("error", (error) => console.error(`Error : ${error}`));
        await redisClient.connect();
    } catch(e) {
        console.error("Cannot connect to the redis server.");
        return;
    }

    // Init models
    await CredentialModel.init();

    // Listen at the port
    app.listen(port, () => {
        console.log(`Service active at port ${port}`);
    });
}

main()