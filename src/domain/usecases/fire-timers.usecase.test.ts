import 'reflect-metadata';
import {
    anything, instance, mock, when,
} from 'ts-mockito';
import { TimerRepository } from '../ports/out/timer.repository';
import { FireTimersUsecase } from './fire-timers.usecase';
import { FiringService } from '../ports/out/firing.service';
import { LoggerServiceTestImpl } from '../../../test/logger.service.impl';

describe('fire timers', () => {
    describe('empty current timers for the moment', () => {
        const timerRepo = mock<TimerRepository>();
        const firingService = mock<FiringService>();
        firingService.fire = jest.fn(() => Promise.resolve(null));
        when(timerRepo.getNearestTimers(anything())).thenResolve([]);
        const usecase = new FireTimersUsecase(
            instance(timerRepo),
            firingService,
            new LoggerServiceTestImpl(),
        );

        it('fires nothing', async () => {
            await usecase.exec('current');
            expect(firingService.fire).not.toBeCalled();
        });
    });

    describe('one timer', () => {
        const timerRepo = mock<TimerRepository>();
        timerRepo.getNearestTimers = jest.fn(
            () => Promise.resolve([{
                id: 1,
                firesAt: new Date(),
                reFiresAt: new Date(),
                reFireDelay: 5,
                done: false,
                url: 'http://google.com',
            }]),
        );
        const firingService = mock<FiringService>();
        firingService.fire = jest.fn(() => Promise.resolve(null));
        const usecase = new FireTimersUsecase(
            timerRepo,
            firingService,
            new LoggerServiceTestImpl(),
        );
        it('calls fire with correct url', async () => {
            await usecase.exec('current');
            expect(firingService.fire).toBeCalledWith('http://google.com/1');
        });
    });

    describe('10 current timers', () => {
        const timerRepo = mock<TimerRepository>();
        timerRepo.getNearestTimers = jest.fn(
            () => Promise.resolve(new Array(10).fill({ url: 'google.com' })),
        );
        const firingService = mock<FiringService>();
        firingService.fire = jest.fn(() => Promise.resolve(null));
        const usecase = new FireTimersUsecase(
            timerRepo,
            firingService,
            new LoggerServiceTestImpl(),
        );
        it('calls fire 10 times', async () => {
            await usecase.exec('current');
            expect(firingService.fire).toBeCalledTimes(10);
        });
    });

    describe('some of timers are failing on fire', () => {
        const timerRepo = mock<TimerRepository>();
        const firingService = mock<FiringService>();
        let fail = true;
        firingService.fire = jest.fn(() => {
            fail = !fail;
            return fail ? Promise.reject(new Error('mock error')) : Promise.resolve(null);
        });

        timerRepo.getNearestTimers = jest.fn(
            () => Promise.resolve(new Array(10).fill({ url: 'google.com' })),
        );
        timerRepo.setDone = jest.fn(() => Promise.resolve(null));
        timerRepo.setReFiresAt = jest.fn(() => Promise.resolve(null));
        const usecase = new FireTimersUsecase(
            timerRepo,
            firingService,
            new LoggerServiceTestImpl(),
        );
        it('handles success 5 times, same on errors', async () => {
            await usecase.exec('current');
            expect(timerRepo.setDone).toBeCalledTimes(5);
            expect(timerRepo.setReFiresAt).toBeCalledTimes(5);
        });
    });
});
