import { compare, hash } from 'bcrypt';
import { CredentialInsertOp } from './op/CredentialInsertOp';
import { CredHashAlgo, Credential, RoleEnum } from './types/Credential';
import * as njwt from 'njwt';
import { randomBytes } from 'crypto';
import { CredStore } from './CredStore';
import { MsgQueueProvider } from '@twit2/std-library/dist/comm/MsgQueueProvider';
import { RPCClient } from '@twit2/std-library/dist/comm/rpc/RPCClient';
import { generateId } from '@twit2/std-library';

// JWT signing key
const jwtSignKey = randomBytes(256);

let userRPC : RPCClient;

/**
 * Prepares the user RPC client.
 */
export async function prepareUserRPC(mq: MsgQueueProvider) {
    console.log("Prepping user service RPC...");
    userRPC = new RPCClient(mq);
    await userRPC.init('t2-user-service');
}

/**
 * Checks whether the specified owner has a credential.
 * @param ownerId The owner ID to check against.
 */
export async function hasCredential(ownerId: string) {
    const prevCred = await CredStore.findCredByOwnerId(ownerId);
    return prevCred != null;
}

/**
 * Creates a new credential.
 * @param c The credential to create.
 */
export async function createCredential(op: CredentialInsertOp): Promise<Credential> {
    // Avoid overflow and empty password
    if((op.password.trim() == "") || (op.password.length > 64))
        throw new Error(`Invalid password specified.`);

    const prevCred = await CredStore.findCredByUName(op.username);

    if(prevCred)
        throw new Error("Credential for owner already exists.");

    // Do the hashing
    // Only bcrypt supported right now :)
    let hashType = (process.env.HASH_ALGO == "bcrypt") ? CredHashAlgo.BCrypt : -1;
    let hashVal: string;

    switch(hashType) {
        case CredHashAlgo.BCrypt:
            hashVal = await hash(op.password, parseInt(process.env.HASH_ROUNDS as string));
            break;
        default:
            throw new Error(`Hashing algorithm '${hashType}' not implemented!`);
    }

    const userId = generateId({ workerId: process.pid, procId: process.ppid });

    // Construct cred object
    const cred : Credential = {
        username: op.username,
        ownerId: userId,
        hashType,
        hashVal,
        role: RoleEnum.User,
        lastUpdated: new Date()
    };

    // Do db op
    await CredStore.createCred(cred);

    // Ask user service nicely for a fresh profile
    try {
        const profile = await userRPC.makeCall("create-profile", { username: op.username, id: userId });

        if(!profile)
            throw new Error("No profile created.");

        console.log(profile);
    } catch(e) {
        console.error("Can't create user profile!");
        console.error(e);
        throw e;
    }

    return cred;
}

/**
 * Verifies credentials.
 * @param ownerId The ID of the owner to fetch the credential for.
 * @param password The password to verify against.
 */
export async function verifyCredential(username: string, password: string): Promise<boolean> {
    const cred = await CredStore.findCredByUName(username);

    if(!cred)
        throw new Error("Credential not found for owner.");

    // Verify hash
    switch(cred.hashType) {
        case CredHashAlgo.BCrypt:
            return await compare(password, cred.hashVal);
        default:
            throw new Error(`Hashing algorithm '${cred.hashType}' not implemented!`);
    }
}

/**
 * Generates a new JWT for the specified credential.
 * @param username The owner of the credential to find.
 */
export async function createJwt(username: string): Promise<string> {
    const cred = await CredStore.findCredByUName(username);

    if(!cred)
        throw new Error("Credential not found for owner.");

    // Generate jwt    
    const claims = {
        iss: "twit2-auth",
        sub: cred.ownerId,
        scope: "self"
    };

    const tok = njwt.create(claims, jwtSignKey);
    tok.setExpiration(new Date().getTime() + 60*100000);

    return tok.toString();
}

/**
 * Gets the credential role.
 * @param id The ID to check.
 */
export async function getCredRole(id: string) {
    const cred = await CredStore.findCredByOwnerId(id);

    if(!cred)
        throw new Error("Credential not found for owner.");

    return cred.role ?? RoleEnum.User;
}

/**
 * Verifies a JWT.
 * @param jwtStr The JWT string.
 * @returns The verified JWT token.
 */
export function verifyJwt(jwtStr: string): njwt.Jwt | undefined {
    return njwt.verify(jwtStr, jwtSignKey);
}