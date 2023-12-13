import { createCredential, createJwt, getCredRole, prepareUserRPC, verifyCredential, verifyJwt } from "./CredMgr";
import { CredHashAlgo, Credential, RoleEnum } from "./types/Credential";
import { RPCServer } from "@twit2/std-library/dist/comm/rpc/RPCServer";
import { RabbitMQQueueProvider } from "@twit2/std-library/dist/comm/providers/RabbitMqProvider";
import { GenericExchangeType, MQ_EXCG_DEFAULT } from "@twit2/std-library/dist/comm/MsgQueueProvider";
import { Limits, TestingUtils } from "@twit2/std-library";
import { CredStore } from "./CredStore";

const mock_amqp = require('mock-amqplib');

/**
 * Mock rabbitmq provider.
 * 
 * This simply creates a mock client in place of a real one.
 */
class MockRabbitMQQueueProvider extends RabbitMQQueueProvider {
    async openQueue(exchange: string, name: string): Promise<void> {
        try {
            return await super.openQueue(exchange, name);
        } catch(e) {
            // Do nothing
        }
    }

    async setup() {
        this.client = await mock_amqp.connect(`amqp://localhost:5672`);
        await this.openExchange(MQ_EXCG_DEFAULT, GenericExchangeType.direct);
    }
}

describe('credential manager tests', () => {
    let rpcProfCreateMode : "data"|"error"|"undefined" = "data";
    let tempJwt = "";

    beforeAll(async()=> {
        // Setup fake rpc
        // We are not testing the user service here :)
        const mq = new MockRabbitMQQueueProvider();
        await mq.setup();

        const rpcs = new RPCServer(mq);
        await rpcs.init("t2-user-service");

        rpcs.defineProcedure({
            name: 'create-profile',
            callback: async(data)=> {
                switch(rpcProfCreateMode) {
                    case "data":
                        return {};
                    case "error":
                        throw new Error("mock error");
                    case "undefined":
                        return undefined;
                }
            }
        });

        await prepareUserRPC(mq);

        // Set env stuff
        process.env.HASH_ALGO = "bcrypt";
        process.env.HASH_ROUNDS = "14";
    });

    test('cred create credential', async()=>{
        const cred = await createCredential({ username: "testing", password: "test12345" });

        expect(cred).not.toBeUndefined();
        expect(cred.username).toBe("testing");
        expect(cred.hashVal).not.toBeFalsy();
        expect(cred.hashType).toBe(CredHashAlgo.BCrypt);
        expect(cred.role).toBe(RoleEnum.User);
        expect(cred.ownerId).not.toBeFalsy();
        expect(cred.lastUpdated).not.toBeUndefined();
    });

    test('cred create: must reject invalid username', async() => {
        await TestingUtils.mustFailAsync(async()=>{await createCredential({ username: "Test User!!!", password: "test12345" });}, "cred with invalid username was made.");
    });

    test('cred create: must reject nonexistent hashing algorithm', async()=> {
        process.env.HASH_ALGO = "invalid";
        await TestingUtils.mustFailAsync(async()=>{await createCredential({ username: "testing3", password: "test12345" });}, "cred with invalid algo was made.");
        process.env.HASH_ALGO = "bcrypt";
    });

    test('cred create: must reject cred for existing username', async()=>{
        await TestingUtils.mustFailAsync(async()=>{await createCredential({ username: "testing", password: "test12345" })}, "cred with existing username was made");
    });

    test('cred create: must reject empty password', async() => {
        await TestingUtils.mustFailAsync(async()=>{await createCredential({ username: "testing2", password: "" })}, "cred was made");
    });

    test('cred create: must reject overflown password', async() => {
        await TestingUtils.mustFailAsync(async()=>{await createCredential({ username: "testing2", password: "a".repeat(Limits.uam.password.max + 1) })}, "cred was made");
    });

    test('cred create: must fail if rpc is unavailable', async() => {
        rpcProfCreateMode = "undefined";
        await TestingUtils.mustFailAsync(async()=>{await createCredential({ username: "testing4", password: "test" })}, "cred with invalid rpc was made");
    });

    test('cred create: must fail if rpc call throws error', async() => {
        rpcProfCreateMode = "error";
        await TestingUtils.mustFailAsync(async()=>{await createCredential({ username: "testing4", password: "test" })}, "cred with errored rpc was made");
        rpcProfCreateMode = "data"; // restore
    });

    test('cred verify: must fail if user does not exist', async() => {
        await TestingUtils.mustFailAsync(async()=>{await verifyCredential("nonexistent", "test")}, "verification proceeded without user fail");
    });

    test('cred verify: verification must be successful for correct user/pass combo', async() =>{
        const result = await verifyCredential("testing", "test12345");
        expect(result).toBe(true);
    });

    test('cred verify: verification must fail for incorrect user/pass combo', async() =>{
        const result = await verifyCredential("testing", "test123456");
        expect(result).toBe(false);
    });

    test('cred make jwt: create jwt for valid user', async()=>{
        tempJwt = await createJwt("testing");

        expect(typeof tempJwt).toBe('string');
        expect(tempJwt).not.toBeFalsy();
    });

    test('cred make jwt: reject jwt request for invalid user', async()=>{
        await TestingUtils.mustFailAsync(async()=>{await createJwt("invalid")}, "jwt created.");
    });

    test('cred verify jwt: jwt validation must succeed for valid jwt', async() => {
        const verifResult = verifyJwt(tempJwt);
        expect(verifResult).not.toBeUndefined();
        expect(typeof verifResult).toBe('object');
    });

    test('cred verify jwt: jwt validation must fail for invalid jwt', async() => {
        await TestingUtils.mustFailAsync(async()=>{verifyJwt("invalid")}, "jwt verified");
    });

    test('cred get role: get role for valid user', async()=>{
        const cred = await CredStore.findCredByUName("testing");
        expect(cred).not.toBeUndefined();
        expect(cred).not.toBeNull();
        expect(await getCredRole((cred as Credential).ownerId)).toBe((cred as Credential).role);
    });

    test('cred get role: reject for invalid user', async() => {
        await TestingUtils.mustFailAsync(async()=>{await getCredRole("invalid")}, "role received.");
    });
});
