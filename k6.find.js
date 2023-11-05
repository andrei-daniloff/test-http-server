import http from 'k6/http';
import { check, sleep } from 'k6';

/** @type {import('k6/options').Options} */
export const options = {
	dns: {
		policy: 'any',
		ttl: '20m'
	},
	stages: [
		{ duration: '10s', target: 10 },
		{ duration: '10s', target: 20 },
		{ duration: '10s', target: 30 },
		{ duration: '10s', target: 40 },
		{ duration: '30s', target: 50 },
		{ duration: '10s', target: 60 },
		{ duration: '10s', target: 70 },
		{ duration: '10s', target: 80 },
		{ duration: '10s', target: 90 },
		{ duration: '30s', target: 100 },
		{ duration: '30s', target: 150 },
	],
};

export default function() {
	const res = http.get('http://127.0.0.1:3000', {});

	check(res, { 'status was 200': (r) => r.status == 200 });

	sleep(0.1);
}
