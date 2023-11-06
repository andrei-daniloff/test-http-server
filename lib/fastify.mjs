import fastify from 'fastify';
import findHandler from './handlers/find.mjs';
import getHandler from './handlers/get.mjs';
import createHandler from './handlers/create.mjs';
import postgres from './initializers/pg.mjs';
import pidusage from './initializers/pidusage.mjs';

const SERVER_PORT = 3000;

const server = fastify();

server.get('/', findHandler);
server.get('/:slug', getHandler);
server.post('/', createHandler);

server.listen({
	host: '127.0.0.1',
	port: SERVER_PORT,
})
	.then(() => {
		console.log(`Server is running on port ${SERVER_PORT}`);
	})
