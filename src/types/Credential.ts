/**
 * Represents the credential hash algorithm.
 */
export enum CredHashAlgo {
    /**
     * Bcrypt hashing algorithm.
     */
    BCrypt = 1,

    /**
     * SHA256 hashing algorithm.
     */
    SHA256 = 2
}

/**
 * Represents a role.
 */
export enum RoleEnum {
    /** A regular user */
    User = 0,

    /** Platform administrator. Has all rights. */
    Admin = 1
}

/**
 * Represents a user credential.
 */
export interface Credential {
    username: string;
    ownerId: string;
    hashType: CredHashAlgo;
    hashVal: string;
    lastUpdated: Date;
    role?: RoleEnum;
}