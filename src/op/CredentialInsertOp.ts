import { CredHashAlgo } from "../types/Credential";

export interface CredentialInsertOp {
    username: string;
    ownerId: string;
    password: string;
}