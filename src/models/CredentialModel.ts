import mongoose, { Schema } from 'mongoose'
import { CredHashAlgo, Credential } from '../types/Credential'
import { Limits } from '@twit2/std-library';

export const CredentialModel = mongoose.model<Credential>('credential', new mongoose.Schema({
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
        default: CredHashAlgo.BCrypt
    },
    hashVal: {
        type: String,
        required: true
    },
    lastUpdated: {
        type: Date,
        required: true
    }
}));