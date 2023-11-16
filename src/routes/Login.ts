import { NextFunction, Request, Response } from "express";
import { createJwt, verifyCredential } from "../CredMgr";
import { CredentialVerifyOp } from "../op/CredentialVerifyOp";
import Ajv from "ajv";
import { APIRespConstructor, APIResponseCodes, Limits } from "@twit2/std-library";

const ajv = new Ajv();

const loginSchema = {
    type: "object",
    properties: {
        username: { type: "string", minLength: Limits.uam.username.min, maxLength: Limits.uam.username.max },
        password: { type: "string", minLength: Limits.uam.password.min, maxLength: Limits.uam.password.max }
    },
    required: ["username", "password"],
    additionalProperties: false
}

/**
 * Handles the login route.
 * @param req The request object.
 * @param res The response object.
 * @param next Next function.
 */
export async function handleLogin(req: Request, res: Response, next: NextFunction) {
    const credVerifyOp: CredentialVerifyOp = req.body;
    res.contentType('json');

    // Verify schema
    if(!ajv.validate(loginSchema, credVerifyOp)) {
        res.statusCode = 400;
        return res.end(JSON.stringify(APIRespConstructor.fromCode(APIResponseCodes.INVALID_REQUEST_BODY)));
    }

    try {
        if(await verifyCredential(credVerifyOp.username, credVerifyOp.password)) {
            const jwt = await createJwt(credVerifyOp.username);
            res.end(JSON.stringify(APIRespConstructor.success(jwt)));
        }
    } catch(e) {
        res.end(JSON.stringify(APIRespConstructor.fail(APIResponseCodes.GENERIC, ((e as Error).message) || "<no information>")));
    }
}