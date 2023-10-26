import { Stan } from "node-nats-streaming";

class Publisher {
  public client: Stan;
  constructor(client: Stan) {
    this.client = client;
  }

  publish(event: string, data: any) {
    return new Promise<void>((resolve, reject) => {
      this.client.publish(event, JSON.stringify(data), (err) => {
        if (err) {
          return reject(err);
        }
        console.log("Event published ");
        resolve();
      });
    });
  }
}

export default Publisher;
