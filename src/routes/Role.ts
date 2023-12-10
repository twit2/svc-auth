import { APIRespConstructor, WithT2Session } from "@twit2/std-library";
import { NextFunction, Request, Response } from "express";
import { getCredRole } from "../CredMgr";

/**
 * Handles the get role route.
 * @param req The request object.
 * @param res The response object.
 * @param next Next function.
 */
export async function handleGetRole(req: Request, res: Response, next: NextFunction) {
    res.contentType('json');
    const role = await getCredRole((req as Request & WithT2Session).session.id);

    return res.end(JSON.stringify(APIRespConstructor.success({
        role
    })));
}