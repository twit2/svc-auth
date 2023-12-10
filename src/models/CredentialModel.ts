import mongoose from 'mongoose'
import { CredHashAlgo, Credential, RoleEnum } from '../types/Credential'
import { Limits, VersionedDoc } from '@twit2/std-library';

const schema = new mongoose.Schema({
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
    role: {
        type: Number,
        required: false,
        default: RoleEnum.User
    },
    hashType: { 
        type: Number,
        required: true,
        min: 1,
        max: 2,
        default: CredHashAlgo.BCrypt
    },
    hashVal: {
        type: String,
        required: true
    },
    lastUpdated: {
        type: Date,
        required: true
    },
    schemaVer: {
        type: Number,
        required: true,
        default: 1
    }
});

export const CredentialModel = mongoose.model<Credential & VersionedDoc>('credential', schema);