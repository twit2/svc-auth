import { Credential } from "./types/Credential";

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

export const CredStoreMock = {
    createCred,
    findCredByUName,
    findCredByOwnerId
}