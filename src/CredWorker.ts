import { RabbitMQQueueProvider } from "@twit2/std-library/dist/comm/providers/RabbitMqProvider"
import { MsgQueue } from "@twit2/std-library";
import { RPCSessionVerifier } from "./rpc/SessionVerifier";

/**
 * Initializes the credential worker.
 * @param url 
 */
async function init(url: string) {
    let mq = new RabbitMQQueueProvider();
    await mq.setup(url);

    // Setup RPC server for session validation
    const server = new MsgQueue.rpc.RPCServer(mq);
    await server.init('session-verification');

    // Initialize RPC session verifier.
    RPCSessionVerifier.init(server);
}

export const CredWorker = {
    init
}