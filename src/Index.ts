import { configDotenv } from 'dotenv';
import express, { Request, Response } from 'express';
import { handleLogin } from './routes/Login';
import { handleRegister } from './routes/Register';
import { handleVerify } from './routes/Verify';
import { CredStore } from './CredStore';
import { CredWorker } from './CredWorker';
import { ErrorHandlingMiddleware } from '@twit2/std-library';

// Load ENV parameters
configDotenv();

// Setup
// ------------------------------------------------
const app = express();
const port = process.env.HTTP_PORT || 3000;

app.use(express.json());

// Routes
// ------------------------------------------------

app.post('/login', handleLogin);
app.post('/register', handleRegister);
app.post('/verify', handleVerify);

app.use(ErrorHandlingMiddleware.handle);

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