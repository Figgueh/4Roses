export class SSEConnection {
  constructor(res) {
    this.res = res;
    this.init();
  }

  init() {
    this.res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });
    this.res.flushHeaders?.();
  }

  send(event, data) {
    this.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }

  close() {
    this.res.end();
  }
}
