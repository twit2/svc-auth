import { RPCServer } from "@twit2/std-library/dist/comm/rpc/RPCServer";
import { getCredRole, verifyJwt } from "../CredMgr";

interface BodyWithSub {
    sub: string;
}

/**
 * Initializes the session verifier RPC server.
 * @param server The RPC server to initialize. 
 */
function init(server: RPCServer) {
    server.defineProcedure({
        name: 'verify-user',
        callback: async (token: string) => {
            if(typeof token !== 'string')
                throw new Error("No token specified.");

            const jwt = verifyJwt(token);
            let jwtBody = jwt?.body as unknown as BodyWithSub;
            
            if(!jwt) {
                throw new Error("Access denied.");
            }
            else {
                return {
                    id: jwtBody.sub
                };
            }
        }
    });

    server.defineProcedure({
        name: 'get-role',
        callback: async(id: string) => {
            if(typeof id !== 'string')
                throw new Error("No valid ID specified.");

            return getCredRole(id);
        }
    })
}

export const AuthRPCServer = {
    init
}