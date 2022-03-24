import 'reflect-metadata';
// @ts-ignore
import request from 'supertest';
import moment = require('moment');
import { container } from '../../src/inversify.config';
import { Server } from '../../src/app/server';
import { Database } from '../../src/infrastructure/db/db';
import { LoggerServiceTestImpl } from '../logger.service.impl';

describe('Timer methods tests', () => {
    const server = container.get<Server>(Server);
    server.run();
    const app = server.getApp();

    container.bind<Database>(Database).toDynamicValue(() => new Database(
        { dbConnection: 'mongodb://localhost:21017/timers_test', port: 1234 },
        new LoggerServiceTestImpl(),
    ));

    describe('Set-get timer flow', () => {
        let timerId = '';
        it('Sets timer', async () => {
            const result: any = await request(app)
                .post('/timers')
                .send({
                    hours: 1,
                    minutes: 1,
                    seconds: 1,
                    url: 'google.com',
                });
            expect(result.statusCode).toBe(200);
            timerId = result.body.id;
        });
        const secondsLeft = moment()
            .add(1, 'h')
            .add(1, 'minutes')
            .add(1, 'seconds')
            .diff(moment(), 'seconds');
        it('Gets timer', async () => {
            const result: any = await request(app)
                .get(`/timers/${timerId}`)
                .send({
                    hours: 1,
                    minutes: 1,
                    seconds: 1,
                    url: 'google.com',
                });
            expect(result.statusCode).toBe(200);
            expect(result.body.id).toEqual(timerId);
            expect(result.body.time_left).toBeGreaterThanOrEqual(secondsLeft - 1);
            expect(result.body.time_left).toBeLessThanOrEqual(secondsLeft + 1);
        });
    });
});
