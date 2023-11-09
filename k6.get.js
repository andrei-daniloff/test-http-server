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
	const res = http.get('http://127.0.0.1:3000/my_super_puper_slug_700', {});

	check(res, { 'status was 200': (r) => r.status == 200 });

	sleep(0.1);
}
