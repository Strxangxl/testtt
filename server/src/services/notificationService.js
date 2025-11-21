class NotificationService {
  constructor() {
    this.connections = new Map();
  }

  addConnection(userId, res) {
    const key = userId?.toString();
    if (!key) return;

    if (!this.connections.has(key)) {
      this.connections.set(key, new Set());
    }

    const userConnections = this.connections.get(key);
    userConnections.add(res);

    res.on('close', () => {
      this.removeConnection(key, res);
    });
  }

  removeConnection(userId, res) {
    const key = userId?.toString();
    if (!key) return;

    const userConnections = this.connections.get(key);
    if (!userConnections) return;

    userConnections.delete(res);
    if (userConnections.size === 0) {
      this.connections.delete(key);
    }
  }

  send(userId, event, payload) {
    const userConnections = this.connections.get(userId?.toString());
    if (!userConnections) return;

    for (const res of userConnections) {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    }
  }
}

module.exports = new NotificationService();
