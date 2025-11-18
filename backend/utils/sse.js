export class SSEConnection {
  constructor(res) {
    this.res = res;
    this.controller = new AbortController();
    this.signal = this.controller.signal;

    this.init();

    // Only listen for res close
    res.on("close", () => {
      try {
        if (!this.controller.signal.aborted) this.controller.abort();
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      }
    });
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

  isAborted(message = "Operation stopped by user.") {
    if (this.signal.aborted) {
      this.send("abort", message);
      return true;
    }
    return false;
  }

  close() {
    this.res.end();
  }
}
