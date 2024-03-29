import mongoose from "mongoose";
import { CredentialModel } from "./models/CredentialModel";
import { CredHashAlgo, Credential } from "./types/Credential";


/**
 * Initializes the credentials DAL.
 */
/* istanbul ignore next */
async function init() {
    if(process.env.DB_URL == null)
        throw new Error("No database URL defined - is your .env file correct?");

    // Connect to database
    try {
        console.log(`Connecting to ${process.env.DB_URL}...`);
        await mongoose.connect(`${process.env.DB_URL}/${process.env.DB_NAME}`);
        console.log(`Connected to database.`);
    } catch(e) {
        console.error("Cannot connect to database server.");
        return;
    }

    // Init models
    await CredentialModel.init();
}

/**
 * Creates a credential.
 * @param cred The credential to push.
 */
async function createCred(cred: Credential) {
    await new CredentialModel(cred).save();
}

/**
 * Finds a credential by username.
 * @param username The username to use.
 */
async function findCredByUName(username: string): Promise<Credential | null> {
    return await CredentialModel.findOne({ username }).exec();
}

/**
 * Finds a credential by owner ID.
 * @param ownerId The owner ID to use.
 * @returns The found credential.
 */
async function findCredByOwnerId(ownerId: string): Promise<Credential | null> {
    return await CredentialModel.findOne({ ownerId }).exec();
}

/**
 * Sets a new profile password.
 * @param ownerId The owner ID. 
 * @param hashType The hash type.
 * @param hashVal The hash value.
 */
async function setNewPassword(ownerId: string, hashType: CredHashAlgo, hashVal: string) {
    const profile = await CredentialModel.findOne({ ownerId });

    if(!profile)
        throw new Error("Profile not found.");

    profile.hashVal = hashVal;
    profile.hashType = hashType;
    await profile.save();
    return profile.toJSON();
}

export const CredStore = {
    init,
    createCred,
    findCredByUName,
    findCredByOwnerId,
    setNewPassword
}