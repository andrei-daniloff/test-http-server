import 'reflect-metadata';

import { __decorate, __metadata, __param } from 'tslib';

import { NestFactory } from '@nestjs/core';
import { Body, Controller, Get, Module, Param, Post } from '@nestjs/common';
import getHandler from './handlers/get.mjs';
import findHandler from './handlers/find.mjs';
import createHandler from './handlers/create.mjs';
import pidusage from './initializers/pidusage.mjs';
import stats from './initializers/stats.mjs';

const SERVER_PORT = 3000;

class FeatureController {
	async find() {
		return await findHandler(undefined, {});
	}

	async get(slug) {
		return await getHandler({ params: { slug } }, {});
	}

	async create(body) {
		return await createHandler({ body }, {});
	}
}

__decorate([
	Get('/'),
	__metadata("design:type", Function),
	__metadata("design:paramtypes", []),
	__metadata("design:returntype", Promise),
], FeatureController.prototype, 'find', null);

__decorate([
	Get('/:slug'),
	__param(0, Param('slug')),
	__metadata("design:type", Function),
	__metadata("design:paramtypes", [String]),
	__metadata("design:returntype", Promise),
], FeatureController.prototype, 'get', null);

__decorate([
	Post('/'),
	__param(0, Body()),
	__metadata("design:type", Function),
	__metadata("design:paramtypes", []),
	__metadata("design:returntype", Promise),
], FeatureController.prototype, 'create', null);

__decorate([
	Controller({ path: '/' }),
], FeatureController);

class Middleware {
	use(req, res, next) {
		const start = Date.now();

		res.on('close', () => {
			stats.time.push(Date.now() - start);
		});

		next();
	}
}

class Application {
	configure(consumer) {
		consumer.apply(Middleware).forRoutes('*');
	}
}

__decorate([Module({
	controllers: [FeatureController],
})], Application);

const app = await NestFactory.create(Application);

app.listen(SERVER_PORT);
