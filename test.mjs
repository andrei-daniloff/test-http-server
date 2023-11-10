import fs from 'fs';

const mode = 'get';

for (const name of ['express4', 'express5', 'fastify', 'nestjs', 'hyper-express', 'rayo', '0http', 'micro', 'go.gin']) {

	const data = fs.readFileSync(`./node.${name}.${mode}.json`, 'utf-8');

	const average = (arr = []) => arr.reduce((p, c) => p + c, 0) / arr.length;

	function calculatePercentile(data, percentile) {
		const sortedData = data.sort((a, b) => a - b);
		const index = (percentile / 100) * (sortedData.length - 1);
		const floor = Math.floor(index);
		const ceil = Math.ceil(index);
		const value = sortedData[floor];

		if (floor === ceil) {
			return value;
		} else {
			const fraction = index - floor;
			const lowerValue = sortedData[floor];
			const upperValue = sortedData[ceil];
			return lowerValue + (upperValue - lowerValue) * fraction;
		}
	}

	const items = data.split('\n')
		.slice(0, -1)
		.map(line => JSON.parse(line))
		.map(item => ({
			cpu: Math.trunc(item.cpu),
			memory: item.memory / 1e+6,

			rss: item?.process?.memory?.rss ?? 0 / 1e+6,
			heap_usage: item?.process?.memory?.heapUsed ?? 0 / 1e+6,
			heap_size: item?.process?.memory?.heapTotal ?? 0 / 1e+6,

			event_loop_latency_mean: item?.process?.ell?.mean ?? 0,
			event_loop_latency_max: item?.process?.ell?.max ?? 0,
			event_loop_latency_p95: item?.process?.ell?.p95 ?? 0,
			event_loop_latency_p99: item?.process?.ell?.p99 ?? 0,

			rps: (item?.process?.time || item.time).length,

			time_mean: average(item?.process?.time || item.time),
			time_max: Math.max(...(item?.process?.time || item.time)),
			time_p95: calculatePercentile(item?.process?.time || item.time, 95),
			time_p99: calculatePercentile(item?.process?.time || item.time, 99),
		}))

	fs.appendFileSync('./result.js', `\n\n\n\n\n\nconst ${name} = ${JSON.stringify(items)};`);
}
