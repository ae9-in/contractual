const http = require('http');
const app = require('./app');
const env = require('./config/env');
const { initRealtime } = require('./services/realtimeService');

const server = http.createServer(app);

initRealtime(server);

server.listen(env.port, () => {
  console.log(`API running on port ${env.port}`);
});
