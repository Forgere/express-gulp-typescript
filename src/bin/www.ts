#!/usr/bin/env node

/**
 * Module dependencies.
 */
import debug from 'debug';
import http from 'http';
import net from 'net'
import {app} from '../app';
const debugge: debug.Debugger = debug('express-gulp-typescript:server');

/**
 * Get port from environment and store in Express.
 */

const port: string | number | boolean = normalizePort(process.env.PORT !== undefined ? process.env.PORT : '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server: http.Server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: string): number | string | boolean  {
  const porter: number = parseInt(val, 10);

  if (isNaN(porter)) {
    // named pipe
    return val;
  }

  if (porter >= 0) {
    // porter number
    return porter;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: NodeJS.ErrnoException): void {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind: string = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      debugge(`${bind}requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      debugge(`${bind}requires elevated privileges`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening(): void {
  const addr: string | net.AddressInfo | null = server.address();
  let bind: string = '';
  if (addr !== null) {
    bind = typeof addr === 'string'
      ? `Pipe ${port}`
      : `Port ${port}`;
  }

  debugge(`Listening on ${bind}`);
}
