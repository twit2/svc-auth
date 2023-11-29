import { NextFunction, Request, Response } from "express";
import Ajv from "ajv";
import { APIRespConstructor, APIResponseCodes, Limits } from "@twit2/std-library";
import { CredentialRegisterOp } from "../op/CredentialRegisterOp";
import { createCredential, createJwt } from "../CredMgr";

const ajv = new Ajv();

const registerSchema = {
    type: "object",
    properties: {
        username: { type: "string", minLength: Limits.uam.username.min, maxLength: Limits.uam.username.max },
        password: { type: "string", minLength: Limits.uam.password.min, maxLength: Limits.uam.password.max }
    },
    required: ["username", "password"],
    additionalProperties: false
}

/**
 * Handles the register route.
 * @param req The request object.
 * @param res The response object.
 * @param next Next function.
 */
export async function handleRegister(req: Request, res: Response, next: NextFunction) {
    const credRegOp: CredentialRegisterOp = req.body;
    res.contentType('json');

    // Verify schema
    if(!ajv.validate(registerSchema, credRegOp)) {
        res.statusCode = 400;
        return res.end(JSON.stringify(APIRespConstructor.fromCode(APIResponseCodes.INVALID_REQUEST_BODY)));
    }

    try {
        const userAcc = await createCredential({
            username: credRegOp.username,
            password: credRegOp.password
        })
        
        // Create JWT.
        const jwt = await createJwt(userAcc.username);
        res.end(JSON.stringify(APIRespConstructor.success(jwt)));
    } catch(e) {
        res.statusCode = 400;
        res.end(JSON.stringify(APIRespConstructor.fail(APIResponseCodes.GENERIC, ((e as Error).message) || "<no information>")));
    }
}