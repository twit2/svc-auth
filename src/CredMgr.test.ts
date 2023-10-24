import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { CredentialModel } from "./models/CredentialModel";
import { createCredential } from "./CredMgr";
import { CredentialInsertOp } from "./op/CredentialInsertOp";
import { Credential } from "./types/Credential";

describe('credential manager tests', () => {
    let mongoServer: MongoMemoryServer;

    beforeAll(async()=> {
        // Setup server
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri(), { dbName: "t2-auth-test" });

        // Init models
        await CredentialModel.init();
        process.env.HASH_ALGO = "bcrypt";
    });

    // Test to ensure the model rejects invalid credentials
    test('cred: reject invalid credentials', async() => {
        let creds : Credential[] = [];

        let credOps : CredentialInsertOp[] = [
            {
                username: "testing",
                ownerId: null as unknown as string,
                password: "testing12345"
            },
            {
                username: "",
                ownerId: "0",
                password: "testing12345"
            },
            {
                username: "test",
                ownerId: "0",
                password: ""
            }
        ];

        for(let op of credOps) {
            try {
                creds.push(await createCredential(op));
            } catch(e) { /* do nothing */ }
        }

        for(let c of creds)
            expect(c).toBeUndefined();
    });

    afterAll(async() => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });
});
