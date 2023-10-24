import { compare, hash } from 'bcrypt';
import { CredentialModel } from './models/CredentialModel';
import { CredentialInsertOp } from './op/CredentialInsertOp';
import { CredHashAlgo, Credential } from './types/Credential';

/**
 * Creates a new credential.
 * @param c The credential to create.
 */
export async function createCredential(op: CredentialInsertOp): Promise<Credential> {
    if(!op.ownerId)
        throw new Error(`No owner ID specified.`);

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