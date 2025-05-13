import open from 'open';
import { exec } from 'child_process';

const port = process.env.PORT || 3000;
const url = `http://localhost:${port}/index.html`;

// Start the server
const server = exec('nodemon server/server.js');

//delay
setTimeout(() => {
  open(url);
}, 1000);

server.stdout.pipe(process.stdout);
server.stderr.pipe(process.stderr);
