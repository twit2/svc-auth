import { APIRespConstructor, APIResponseCodes, T2Session, WithT2Session } from "@twit2/std-library";
import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../CredMgr";

/**
 * Handles session verification.
 */
async function handle(req: Request, res: Response, next: NextFunction) {
    res.contentType('json');
    const bearerToken = req.headers.authorization?.substring(7);
    
    if((!bearerToken) || (bearerToken.trim() == "")) {
        res.statusCode = 403;
        return res.end(JSON.stringify(APIRespConstructor.fromCode(APIResponseCodes.INVALID_REQUEST_BODY)));
    }

    try {
        // Check the token
        const jwt : any = verifyJwt(bearerToken);

        if(!jwt) {
            res.statusCode = 403;
            return res.end(JSON.stringify(APIRespConstructor.fromCode(APIResponseCodes.ACCESS_DENIED)));
        }

        let req2 = req as Request & WithT2Session;
        req2.session = { id: jwt.body.sub };

        next();
    } catch(e) {
        res.statusCode = 403;
        res.end(JSON.stringify(APIRespConstructor.fromCode(APIResponseCodes.ACCESS_DENIED)));
        console.error(e);
    }
}

export const LocalTokenVerifier = {
    handle
}