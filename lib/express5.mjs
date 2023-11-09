import express from 'express5';
import bodyParser from 'body-parser';
import findHandler from './handlers/find.mjs';
import getHandler from './handlers/get.mjs';
import createHandler from './handlers/create.mjs';
import postgres from './initializers/pg.mjs';
import pidusage from './initializers/pidusage.mjs';
import stats from './initializers/stats.mjs';

const SERVER_PORT = 3000;

const app = express();

app.use(bodyParser.json(), (req, res, next) => {
	const start = Date.now();

	res.on('close', () => {
		stats.time.push(Date.now() - start);
	});

	next();
});

app.get('/', findHandler);
app.get('/:slug', getHandler);
app.post('/', createHandler);

app.listen(SERVER_PORT, () => {
	console.log(`Server is running on port ${SERVER_PORT}`);
});
