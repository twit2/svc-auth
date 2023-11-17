import { compare, hash } from 'bcrypt';
import { CredentialInsertOp } from './op/CredentialInsertOp';
import { CredHashAlgo, Credential } from './types/Credential';
import * as njwt from 'njwt';
import { randomBytes } from 'crypto';
import { CredStore } from './CredStore';

// JWT signing key
const jwtSignKey = randomBytes(256);

/**
 * Creates a new credential.
 * @param c The credential to create.
 */
export async function createCredential(op: CredentialInsertOp): Promise<Credential> {
    // Avoid overflow and empty password
    if((op.password.trim() == "") || (op.password.length > 64))
        throw new Error(`Invalid password specified.`);

    const prevCred = await CredStore.findCredByOwnerId(op.ownerId);

    if(prevCred)
        throw new Error("Credential for owner already exists.");

    // Do the hashing
    // Only bcrypt supported right now :)
    let hashType = (process.env.HASH_ALGO == "bcrypt") ? CredHashAlgo.BCrypt : -1;
    let hashVal: string;

    switch(hashType) {
        default:
            throw new Error(`Hashing algorithm '${hashType}' not implemented!`);
        case CredHashAlgo.BCrypt:
            hashVal = await hash(op.password, parseInt(process.env.HASH_ROUNDS as string));
            break;
    }

    // Construct cred object
    const cred : Credential = {
        username: op.username,
        ownerId: op.ownerId,
        hashType,
        hashVal,
        lastUpdated: new Date()
    };

    // Do db op
    await CredStore.createCred(cred);
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
        default:
            throw new Error(`Hashing algorithm '${cred.hashType}' not implemented!`);
        case CredHashAlgo.BCrypt:
            return await compare(password, cred.hashVal);
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
    tok.setExpiration(new Date().getTime() + 60*10000);

    return tok.toString();
}

/**
 * Verifies a JWT.
 * @param jwtStr The JWT string.
 * @returns The verified JWT token.
 */
export function verifyJwt(jwtStr: string): njwt.Jwt | undefined {
    return njwt.verify(jwtStr, jwtSignKey);
}