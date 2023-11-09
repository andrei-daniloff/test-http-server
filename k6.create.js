import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

import http from 'k6/http';
import { check, sleep } from 'k6';

/** @type {import('k6/options').Options} */
export const options = {
	dns: {
		policy: 'any',
		ttl: '20m'
	},
	stages: [
		{ duration: '20s', target: 10 },
		{ duration: '20s', target: 20 },
		{ duration: '20s', target: 30 },
		{ duration: '20s', target: 40 },
		{ duration: '40s', target: 50 },
		{ duration: '20s', target: 60 },
		{ duration: '20s', target: 70 },
		{ duration: '20s', target: 80 },
		{ duration: '40s', target: 90 },
		{ duration: '60s', target: 100 },
		{ duration: '60s', target: 150 },
		{ duration: '20s', target: 100 },
		{ duration: '20s', target: 50 },
		{ duration: '20s', target: 0 },
	],
};

export default function() {
	const data = {
		"slug": uuidv4(),
		"title": uuidv4(),
		"description": uuidv4().repeat(100),
		"attributes": { "a": 1 }
	};

	const res = http.post('http://127.0.0.1:3000', JSON.stringify(data), {
		headers: { 'Content-Type': 'application/json' },
	});

	check(res, { 'status was 200': (r) => r.status == 200 });

	sleep(0.1);
}
