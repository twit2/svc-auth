import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { CredentialModel } from "./models/CredentialModel";
import { createCredential, verifyCredential } from "./CredMgr";
import { CredentialInsertOp } from "./op/CredentialInsertOp";
import { CredHashAlgo, Credential } from "./types/Credential";

describe('credential manager tests', () => {
    let mongoServer: MongoMemoryServer;

    beforeAll(async()=> {
        // Setup server
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri(), { dbName: "t2-auth-test" });

        // Init models
        await CredentialModel.init();

        // Set env stuff
        process.env.HASH_ALGO = "bcrypt";
        process.env.HASH_ROUNDS = "14";
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

    // Test to ensure real credentials are properly made
    test('cred: create basic', async() => {
        let cred = await createCredential({
            username: "hello",
            ownerId: "0",
            password: "testing12345"
        });

        expect(cred.hashVal).not.toBe('');
        expect(cred.lastUpdated).not.toBeUndefined();
        expect(cred.ownerId).not.toBe('');
        expect(cred.hashType).toBe(CredHashAlgo.BCrypt);
    });

    // Checks if we can lookup and verify a credential
    test('cred: lookup and verify', async() =>{
        expect(await verifyCredential("hello", "testing12345")).toBe(true);
    });

    afterAll(async() => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });
});
