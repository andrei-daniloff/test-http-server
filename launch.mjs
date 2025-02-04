import * as fs from 'node:fs';

import { execaCommand, execaNode } from "execa";

function delay(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

for (const mode of ['get', 'find', 'create']) {
	for (const name of ['express4', 'express5', 'fastify', 'nestjs', 'hyper-express', 'rayo', '0http', 'micro', 'go.gin']) {
		fs.truncateSync('./launch.json');

		if (name === 'go.gin' && mode === 'create') {
			continue;
		}

		const command = name === 'go.gin' ? `./go/${name}` : `node ./lib/${name}.mjs`;

		const server = execaCommand(command);

		await Promise.all([
			server.catch((error) => {
				console.dir(error, { colors: true, compact: false, depth: 2 });
			}),
			delay(3000)
				.then(() => execaCommand(`k6 run ./k6.${mode}.js`))
				.then((result) => {
					fs.writeFileSync(`k6.${name}.${mode}.md`, result.stdout);
				})
				.then(() => delay(3000))
				.then(() => server.kill()),
		]);

		const file = name === 'go.gin' ? `go.${name}.${mode}.json` : `node.${name}.${mode}.json`;

		fs.copyFileSync('./launch.json', file);
	}

}
