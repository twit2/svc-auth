import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { CredentialModel } from "./models/CredentialModel";
import { createCredential, createJwt, prepareUserRPC, verifyCredential, verifyJwt } from "./CredMgr";
import { CredentialInsertOp } from "./op/CredentialInsertOp";
import { CredHashAlgo, Credential } from "./types/Credential";
import { NullMqProvider } from "@twit2/std-library/dist/comm/providers/NullMqProvider";
import { RPCServer } from "@twit2/std-library/dist/comm/rpc/RPCServer";
import { RabbitMQQueueProvider } from "@twit2/std-library/dist/comm/providers/RabbitMqProvider";
import { GenericExchangeType, MQ_EXCG_DEFAULT } from "@twit2/std-library/dist/comm/MsgQueueProvider";

const mock_amqp = require('mock-amqplib');

/**
 * Mock rabbitmq provider.
 * 
 * This simply creates a mock client in place of a real one.
 */
class MockRabbitMQQueueProvider extends RabbitMQQueueProvider {
    constructor() {
        super();
    }

    async setup() {
        this.client = await mock_amqp.connect(`amqp://localhost:5672`);
        await this.openExchange(MQ_EXCG_DEFAULT, GenericExchangeType.direct);
    }
}

describe('credential manager tests', () => {
    let mongoServer: MongoMemoryServer;

    beforeAll(async()=> {
        // Setup server
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri(), { dbName: "t2-auth-test" });

        // Init models
        await CredentialModel.init();

        // Setup fake rpc
        // We are not testing the user service here :)
        const mq = new MockRabbitMQQueueProvider();
        await mq.setup();

        const rpcs = new RPCServer(mq);
        await rpcs.init("t2-user-service");

        rpcs.defineProcedure({
            name: 'create-profile',
            callback: async(data)=> { return {}; }
        });

        await prepareUserRPC(mq);

        // Set env stuff
        process.env.HASH_ALGO = "bcrypt";
        process.env.HASH_ROUNDS = "14";
    });

    // Test to ensure the model rejects invalid credentials
    test('cred: reject invalid credentials', async() => {
        let creds : Credential[] = [];

        let credOps : CredentialInsertOp[] = [
            {
                username: "",
                password: "testing12345"
            },
            {
                username: "test",
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

    // This test must fail
    test('cred: reject invalid user for jwt creation', async() => {
        let jwt;

        try {
            jwt = await createJwt("invalid_user");
        } catch(e) {
            // Success
            return;
        }

        expect(jwt).toBeUndefined(); // Manual fail
    });

    // Creates the cred JWT and validates it
    test('cred: create and validate jwt for valid user', async() => {
        const jwt = await createJwt("hello");
        expect(verifyJwt(jwt)).not.toBe(undefined);
    });

    afterAll(async() => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });
});
