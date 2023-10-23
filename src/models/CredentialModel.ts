import mongoose, { Schema } from 'mongoose'
import { CredHashAlgo, Credential } from '../types/Credential'

export const CredentialModel = mongoose.model<Credential>('credential', new mongoose.Schema({
    ownerId: {
        type: String,
        required: true,
        min: 2,
        max: 32
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