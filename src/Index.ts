import { configDotenv } from 'dotenv';
import express from 'express';
import { handleLogin } from './routes/Login';
import { handleRegister } from './routes/Register';
import { handleVerify } from './routes/Verify';
import { handleChangePassword } from './routes/ChangePassword';
import { CredStore } from './CredStore';
import { CredWorker } from './CredWorker';
import { ErrorHandlingMiddleware } from '@twit2/std-library';
import { handleGetRole } from './routes/Role';
import { LocalTokenVerifier } from './middleware/LocalTokenVerifier';
require('express-async-errors');

// Load ENV parameters
configDotenv();

// Setup
// ------------------------------------------------
const app = express();
const port = process.env.HTTP_PORT ?? 3200;

app.use(express.json());

// Routes
// ------------------------------------------------

app.post('/login', handleLogin);
app.post('/register', handleRegister);

app.use(LocalTokenVerifier.handle);

app.post('/verify', handleVerify);
app.get('/role', handleGetRole);
app.patch('/password', handleChangePassword);

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