import { CredHashAlgo, Credential } from "./types/Credential";

const creds : Credential[] = [];

/**
 * Creates a credential.
 * @param cred The credential to push.
 */
async function createCred(cred: Credential) {
    creds.push(cred);
}

/**
 * Finds a credential by username.
 * @param username The username to use.
 */
async function findCredByUName(username: string): Promise<Credential | null> {
    return creds.find(x => x.username == username) ?? null;
}

/**
 * Finds a credential by owner ID.
 * @param ownerId The owner ID to use.
 * @returns The found credential.
 */
async function findCredByOwnerId(ownerId: string): Promise<Credential | null> {
    return creds.find(x => x.ownerId == ownerId) ?? null;
}

/**
 * Sets a new profile password.
 * @param ownerId The owner ID. 
 * @param hashType The hash type.
 * @param hashVal The hash value.
 */
async function setNewPassword(ownerId: string, hashType: CredHashAlgo, hashVal: string) {
    const profile = await findCredByOwnerId(ownerId);

    if(!profile)
        throw new Error("Profile not found.");

    profile.hashVal = hashVal;
    profile.hashType = hashType;
    return profile;
}

export const CredStoreMock = {
    createCred,
    findCredByUName,
    findCredByOwnerId,
    setNewPassword
}