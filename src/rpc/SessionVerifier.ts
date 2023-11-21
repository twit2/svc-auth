import { RPCServer } from "@twit2/std-library/dist/comm/rpc/RPCServer";
import { verifyJwt } from "../CredMgr";

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

            try {
                // console.log(`DEBUG Verify: ${token}`); 
                const jwt = verifyJwt(token);
                let jwtBody = jwt?.body as unknown as BodyWithSub;
                
                if(!jwt) {
                    // console.log(`Debug fail`);
                    console.log(jwtBody);
                    throw new Error("Access denied.");
                }
                else {
                    return {
                        id: jwtBody.sub
                    };
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