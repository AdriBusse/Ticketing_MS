import nats, { Stan } from 'node-nats-streaming';

class natsWrapper {
  //? might be undefined for a time
  private _client?: Stan;

  get client() {
    if (!this._client) {
      throw new Error('cannot return client befor it connected');
    }
    return this._client;
  }
  connect(clusterId: string, clientId: string, url: string) {
    this._client = nats.connect(clusterId, clientId, { url });

    return new Promise((resolve, reject) => {
      this.client.on('connect', () => {
        console.log(`Nats connected`);
        resolve(1);
      });
      this.client.on('error', (err) => {
        reject(err);
      });
    });
  }
}

//singelton nats
export const NatsWrapper = new natsWrapper();
