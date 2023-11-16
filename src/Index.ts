import { configDotenv } from 'dotenv';
import express, { Request, Response } from 'express';
import { handleLogin } from './routes/Login';
import { handleRegister } from './routes/Register';
import { handleVerify } from './routes/Verify';
import { body } from 'express-validator';
import { Limits } from '@twit2/std-library';
import { CredStore } from './CredStore';
import { CredWorker } from './CredWorker';

// Load ENV parameters
configDotenv();

// Setup
// ------------------------------------------------
const app = express();
const port = process.env.HTTP_PORT || 3000;

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
    await CredStore.init();
    await CredWorker.init(process.env.MQ_URL as string);

    // Listen at the port
    app.listen(port, () => {
        console.log(`Service active at port ${port}`);
    });
}

main()