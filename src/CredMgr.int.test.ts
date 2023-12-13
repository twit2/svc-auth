import './CredMgr.test';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { CredentialModel } from './models/CredentialModel';

let mongoServer: MongoMemoryServer;

beforeAll(async()=> {
    // Setup server
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { dbName: "t2-user-test" });

    // Init models
    await CredentialModel.init();
});

afterAll(async() => {
    await mongoose.disconnect();
    await mongoServer.stop();
});