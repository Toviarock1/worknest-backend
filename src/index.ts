import http from "http";
import app from "./app.js";
import setupMiddleware from "./startup/prod.js";
import { initSocket } from "./config/socket.js";
import { env } from "./config/env.js";
import { configureCloudinary } from "./config/cloudinary.js";

setupMiddleware(app);
const port = env.PORT;
const server = http.createServer(app);

//initialize the socket
initSocket(server);

configureCloudinary();

server.listen(port, () => {
  console.log(`listening on localhost: ${port}, NODE_ENV: ${env.NODE_ENV}`);
});
