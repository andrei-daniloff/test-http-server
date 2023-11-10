import cero from '0http'
import bodyParser from 'body-parser';
import findHandler from './handlers/find.mjs';
import getHandler from './handlers/get.mjs';
import createHandler from './handlers/create.mjs';
import postgres from './initializers/pg.mjs';
import pidusage from './initializers/pidusage.mjs';
import stats from './initializers/stats.mjs';

const SERVER_PORT = 3000;

const { router, server } = cero();

router.use(bodyParser.json(), (req, res, next) => {
	const start = Date.now();

	res.on('close', () => {
		stats.time.push(Date.now() - start);
	});

	next();
});

router.get('/', async (req, res, next) => {
	const result = await findHandler(req, {});

	res.end(JSON.stringify(result));

	next();
});

router.get('/:slug', async (req, res, next) => {
	const result = await getHandler(req, {});

	res.end(JSON.stringify(result));

	next();
});

router.post('/', async (req, res, next) => {
	const result = await createHandler(req, {});

	res.end(JSON.stringify(result));

	next();
});

server.listen(SERVER_PORT)
