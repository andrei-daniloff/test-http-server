import rayo from 'rayo';
import send from '@rayo/send';
import findHandler from './handlers/find.mjs';
import getHandler from './handlers/get.mjs';
import createHandler from './handlers/create.mjs';
import postgres from './initializers/pg.mjs';
import pidusage from './initializers/pidusage.mjs';

import stats from './initializers/stats.mjs';

const SERVER_PORT = 3000;

rayo({ port: SERVER_PORT })
	.through(send())
	.through((req, res, step) => {
		const start = Date.now();

		res.on('close', () => {
			stats.time.push(Date.now() - start);
		});

		step();
	})
	.get('/', findHandler)
	.get('/:slug', getHandler)
	.post('/', createHandler)
	.start(() => {
		console.log(`Server is running on port ${SERVER_PORT}`);
	});
