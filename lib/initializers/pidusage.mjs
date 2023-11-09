import { monitorEventLoopDelay } from 'perf_hooks';
import * as fs from 'fs';

import pidusage from "pidusage";
import stats2 from './stats.mjs';

const monitor = monitorEventLoopDelay({ resolution: 10 });

monitor.enable();

fs.truncateSync('./launch.json');

setInterval(() => {
	pidusage(process.pid, {}, (err, stats) => {
		fs.appendFileSync('./launch.json', JSON.stringify({
			...stats,
			process: {
				memory: process.memoryUsage(),
				cpu: process.cpuUsage(),
				resource: process.resourceUsage(),
				ell: {
					min: Math.trunc(monitor.min / 1e+6),
					max: Math.trunc(monitor.max / 1e+6),
					mean: Math.trunc(monitor.mean / 1e+6),
					p95: Math.trunc(monitor.percentile(95) / 1e+6),
					p99: Math.trunc(monitor.percentile(99) / 1e+6),
				},
				time: stats2.time,
			}
		}) + '\n');

		stats2.time = [];
	});
}, 1000);

export default {};
