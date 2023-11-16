import { RabbitMQQueueProvider } from "@twit2/std-library/dist/comm/providers/RabbitMqProvider"

/**
 * Initializes the credential worker.
 * @param url 
 */
async function init(url: string) {
    let mq = new RabbitMQQueueProvider();
    await mq.setup(url);

    // Open the queues
    await mq.openQueue("session_validation");
}

export const CredWorker = {
    init
}