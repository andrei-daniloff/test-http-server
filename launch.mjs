import * as fs from 'node:fs';

import { execaCommand, execaNode } from "execa";

function delay(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

for (const mode of ['get', 'find']) {
	for (const name of ['express4', 'express5', 'fastify', 'hyper-express', 'rayo']) {
		const server = execaNode(`./lib/${name}.mjs`, []);

		await Promise.all([
			server.catch((error) => {
				console.dir(error, { colors: true, compact: false, depth: 2 });
			}),
			delay(3000)
				.then(() => execaCommand(`k6 run ./k6.${mode}.js`))
				.then(() => delay(3000))
				.then(() => server.kill()),
		]);

		fs.copyFileSync('./launch.json', `node.${name}.${mode}.json`);
	}

}
