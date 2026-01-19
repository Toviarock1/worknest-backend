import http from "http";
import app from "./app";
import setupMiddleware from "./startup/prod";
import { initSocket } from "./config/socket";
import { env } from "./config/env";

setupMiddleware(app);
const port = env.PORT;
const server = http.createServer(app);

//initialize the socket
initSocket(server);

server.listen(port, () => {
  console.log(`listening on localhost: ${port}, NODE_ENV: ${env.NODE_ENV}`);
});
