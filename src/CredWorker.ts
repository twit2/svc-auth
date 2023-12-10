import { RabbitMQQueueProvider } from "@twit2/std-library/dist/comm/providers/RabbitMqProvider"
import { MsgQueue } from "@twit2/std-library";
import { AuthRPCServer } from "./rpc/AuthRPCServer";
import { prepareUserRPC } from "./CredMgr";

/**
 * Initializes the credential worker.
 * @param url 
 */
async function init(url: string) {
    let mq = new RabbitMQQueueProvider();
    await mq.setup(url);

    // Setup RPC server for session validation
    const server = new MsgQueue.rpc.RPCServer(mq);
    await server.init('t2-auth-service');

    // Initialize RPC session verifier.
    AuthRPCServer.init(server);

    await prepareUserRPC(mq);
}

export const CredWorker = {
    init
}