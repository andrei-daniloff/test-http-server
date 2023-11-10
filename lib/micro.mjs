import { Server } from 'http';
import { serve, json } from 'micro';
import findHandler from './handlers/find.mjs';
import getHandler from './handlers/get.mjs';
import createHandler from './handlers/create.mjs';
import postgres from './initializers/pg.mjs';
import pidusage from './initializers/pidusage.mjs';
import stats from './initializers/stats.mjs';

const SERVER_PORT = 3000;
const SLUG_RE = /\/(.+)/;

const server = new Server(
	serve(async (req, res) => {
		const start = Date.now();

		res.on('close', () => {
			stats.time.push(Date.now() - start);
		});

		const method = req.method;
		const url = req.url;

		if (method === 'GET') {
			if (url === '/') {
				return await findHandler(req, res);
			} else if (SLUG_RE.test(url)) {
				const slug = url.match(SLUG_RE)[1];

				return await getHandler({ params: { slug } }, res);
			}
		} else if (method === 'POST') {
			if (url === '/') {
				const body = await json(req);

				return await createHandler({ body }, res);
			}
		}
	}),
);

server.listen(SERVER_PORT);
