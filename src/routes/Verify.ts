import { APIRespConstructor, APIResponseCodes } from "@twit2/std-library";
import { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../CredMgr";

/**
 * Handles the register route.
 * @param req The request object.
 * @param res The response object.
 * @param next Next function.
 */
export function handleVerify(req: Request, res: Response, next: NextFunction) {
    res.contentType('json');
    const bearerToken = req.headers.authorization?.substring(7);
    
    if((!bearerToken) || (bearerToken.trim() == "")) {
        res.statusCode = 403;
        return res.end(JSON.stringify(APIRespConstructor.fromCode(APIResponseCodes.INVALID_REQUEST_BODY)));
    }

    try {
        // Check the token
        const jwt = verifyJwt(bearerToken);

        if(!jwt) {
            res.statusCode = 403;
            return res.end(JSON.stringify(APIRespConstructor.fromCode(APIResponseCodes.ACCESS_DENIED)));
        }

        return res.end(JSON.stringify(APIRespConstructor.success()));
    } catch(e) {
        res.statusCode = 403;
        res.end(JSON.stringify(APIRespConstructor.fail(APIResponseCodes.GENERIC, ((e as Error).message) || "<no information>")));
    }
}