import { RPCServer } from "@twit2/std-library/dist/comm/rpc/RPCServer";
import { hasCredential } from "../CredMgr";

/**
 * Initializes the session verifier RPC server.
 * @param server The RPC server to initialize. 
 */
function init(server: RPCServer) {
    server.defineProcedure({
        name: 'user-exists',
        callback: async (uid: string) => {
            return hasCredential(uid);
        }
    })
}

export const CredentialRPC = {
    init
}