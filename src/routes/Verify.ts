import { APIRespConstructor } from "@twit2/std-library";
import { NextFunction, Request, Response } from "express";

/**
 * Handles the register route.
 * @param req The request object.
 * @param res The response object.
 * @param next Next function.
 */
export function handleVerify(req: Request, res: Response, next: NextFunction) {
    res.contentType('json');
    return res.end(JSON.stringify(APIRespConstructor.success())); // Check done by middleware
}