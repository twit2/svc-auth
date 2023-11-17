import { RPCServer } from "@twit2/std-library/dist/comm/rpc/RPCServer";
import { verifyJwt } from "../CredMgr";

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

            try {
                const jwt = verifyJwt(token);
                
                if(!jwt) {
                    throw new Error("Access denied.");
                }
                else {
                    return true;
                }
            } catch(e) {
                throw e;
            }
        }
    })
}

export const RPCSessionVerifier = {
    init
}