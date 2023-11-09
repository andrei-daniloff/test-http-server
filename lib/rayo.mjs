import rayo from 'rayo';
import send from '@rayo/send';
import findHandler from './handlers/find.mjs';
import getHandler from './handlers/get.mjs';
import createHandler from './handlers/create.mjs';

const SERVER_PORT = 3000;

rayo({ port: SERVER_PORT })
	.through(send())
	.get('/', findHandler)
	.get('/:slug', getHandler)
	.post('/', createHandler)
	.start(() => {
		console.log(`Server is running on port ${SERVER_PORT}`);
	});
