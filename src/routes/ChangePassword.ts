import { APIRespConstructor, WithT2Session } from "@twit2/std-library";
import { NextFunction, Request, Response } from "express";
import { changePassword } from "../CredMgr";

/**
 * Handles the change password route.
 * @param req The request object.
 * @param res The response object.
 * @param next Next function.
 */
export async function handleChangePassword(req: Request, res: Response, next: NextFunction) {
    res.contentType('json');
    let uid = (req as Request & WithT2Session).session.id;
    await changePassword(uid, req.body.password);
    
    // We do not need to give the client the resultant credential - this could pose a potential security problem :)
    return res.end(JSON.stringify(APIRespConstructor.success()));
}