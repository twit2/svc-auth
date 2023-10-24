import { compare, hash } from 'bcrypt';
import { CredentialModel } from './models/CredentialModel';
import { CredentialInsertOp } from './op/CredentialInsertOp';
import { CredHashAlgo, Credential } from './types/Credential';
import * as njwt from 'njwt';
import { randomBytes } from 'crypto';

// JWT signing key
const jwtSignKey = randomBytes(256);

/**
 * Creates a new credential.
 * @param c The credential to create.
 */
export async function createCredential(op: CredentialInsertOp): Promise<Credential> {
    if(!op.ownerId)
        throw new Error(`No owner ID specified.`);

    // Avoid overflow and empty password
    if((op.password.trim() == "") || (op.password.length > 64))
        throw new Error(`Invalid password specified.`);

    const prevCred = await CredentialModel.findOne({ ownerId: op.ownerId }).exec();

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
    await new CredentialModel(cred).save();
    return cred;
}

/**
 * Verifies credentials.
 * @param ownerId The ID of the owner to fetch the credential for.
 * @param password The password to verify against.
 */
export async function verifyCredential(ownerId: string, password: string): Promise<boolean> {
    const cred = await CredentialModel.findOne({ ownerId: ownerId }).exec();

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
 * @param ownerId The owner of the credential to find.
 */
export async function createJwt(ownerId: string): Promise<string> {
    const cred = await CredentialModel.findOne({ ownerId: ownerId }).exec();

    if(!cred)
        throw new Error("Credential not found for owner.");

    // Generate jwt    
    const claims = {
        iss: "twit2-auth",
        sub: ownerId,
        scope: "self"
    };

    const tok = njwt.create(claims, jwtSignKey);
    tok.setExpiration(new Date().getTime() + 60*1000);

    return tok.toString();
}