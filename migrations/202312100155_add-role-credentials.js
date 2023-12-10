const mongoose = require('mongoose');
const { Limits } = require('@twit2/std-library');
const { configDotenv } = require('dotenv');

const oldSchema = new mongoose.Schema({
    ownerId: {
        type: String,
        required: true,
        min: Limits.general.id.min,
        max: Limits.general.id.max
    },
    username: {
        type: String,
        required: true,
        min: Limits.uam.username.min,
        max: Limits.uam.username.max
    },
    hashType: { 
        type: Number,
        required: true,
        min: 1,
        max: 2,
        default: 1 // BCrypt - Check Credential.ts
    },
    hashVal: {
        type: String,
        required: true
    },
    lastUpdated: {
        type: Date,
        required: true
    }
});

const OldCredentialModel = mongoose.model('credentialOld', oldSchema, 'credentials');

const newSchema = new mongoose.Schema({
    ownerId: {
        type: String,
        min: Limits.general.id.min,
        max: Limits.general.id.max
    },
    username: {
        type: String,
        min: Limits.uam.username.min,
        max: Limits.uam.username.max
    },
    role: {
        type: Number,
        default: 0 // Check RoleEnum.ts
    },
    hashType: { 
        type: Number,
        min: 1,
        max: 2,
        default: 1 // BCrypt - Check Credential.ts
    },
    hashVal: {
        type: String
    },
    lastUpdated: {
        type: Date
    },
    schemaVer: {
        type: Number
    }
});

const NewCredentialModel = mongoose.model('credentialNew', newSchema, 'credentials');

configDotenv();

async function migrate() {
    if(process.env.DB_URL == null)
        throw new Error("No database URL defined - is your .env file correct?");

    // Connect to database
    try {
        await mongoose.connect(`${process.env.DB_URL}/${process.env.DB_NAME}`);
    } catch(e) {
        console.error("Cannot connect to database server.");
        return;
    }

    const oldData = await OldCredentialModel.find().exec();

    for(let doc of oldData) {
        if((doc.toJSON()).schemaVer >= 1)
            continue; // Don't update updated documents

        console.log(`Migrating ${doc.id}...`);
        
        const newDoc = new NewCredentialModel({
            _id: doc._id,
            ownerId: doc.ownerId,
            username: doc.username,
            role: 0,
            hashType: doc.hashType,
            hashVal: doc.hashVal,
            lastUpdated: doc.lastUpdated,
            schemaVer: 1
        });

        await NewCredentialModel.findByIdAndUpdate(doc._id, newDoc, { new: true, upsert: true });
    }

    await mongoose.disconnect();
}

module.exports = migrate;