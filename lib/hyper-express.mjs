import { Server } from 'hyper-express';
import findHandler from './handlers/find.mjs';
import getHandler from './handlers/get.mjs';
import createHandler from './handlers/create.mjs';
import postgres from './initializers/pg.mjs';
import pidusage from './initializers/pidusage.mjs';
import stats from './initializers/stats.mjs';

const SERVER_PORT = 3000;

const server = new Server();

server.use((req, res, next) => {
	const start = Date.now();

	res.on('close', () => {
		stats.time.push(Date.now() - start);
	});

	next();
});

server.get('/', findHandler);
server.get('/:slug', getHandler);
server.post('/', createHandler);

server.listen(SERVER_PORT, '127.0.0.1')
	.then(() => {
		console.log(`Server is running on port ${SERVER_PORT}`);
	})
