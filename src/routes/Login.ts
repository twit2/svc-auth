import { NextFunction, Request, Response } from "express";

/**
 * Handles the login route.
 * @param req The request object.
 * @param res The response object.
 * @param next Next function.
 */
export function handleLogin(req: Request, res: Response, next: NextFunction) {
    console.log("Debug");
}