import nats, { Stan } from "node-nats-streaming";

class NatsClient {
  public client: Stan;

  connect(clusterId: string, clientId: string, url: string) {
    this.client = nats.connect(clusterId, clientId, { url });
    return new Promise<void>((resolve, reject) => {
      this.client.on("connect", () => {
        console.log("Connected to NATS");
        resolve();
      });

      this.client.on("error", (err) => {
        console.log("Some error occured ", err);
        reject(err);
      });
    });
  }
}

export const natsClient = new NatsClient();
