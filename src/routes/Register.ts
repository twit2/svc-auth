import { NextFunction, Request, Response } from "express";

/**
 * Handles the register route.
 * @param req The request object.
 * @param res The response object.
 * @param next Next function.
 */
export function handleRegister(req: Request, res: Response, next: NextFunction) {
    res.send({success: true});
}