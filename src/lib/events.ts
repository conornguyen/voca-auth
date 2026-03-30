import { PubSub } from '@google-cloud/pubsub';

// Initialize the PubSub client. By default, it uses ADC (Application Default Credentials)
const pubsub = new PubSub();

export const publishEvent = async (eventName: string, payload: any) => {
  try {
    const dataBuffer = Buffer.from(JSON.stringify(payload));
    const messageId = await pubsub.topic(eventName).publishMessage({ data: dataBuffer });
    console.log(`[PubSub] Event ${eventName} published with ID: ${messageId}`);
    return messageId;
  } catch (error) {
    console.error(`[PubSub] Failed to publish event ${eventName}:`, error);
    // Don't throw for now to prevent breaking DB transactions just because event bus is down
  }
};
