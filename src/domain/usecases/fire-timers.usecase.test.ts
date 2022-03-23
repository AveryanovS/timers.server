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
        when(firingService.fire(anything())).thenResolve(null);
        when(timerRepo.getNearestTimers(anything())).thenResolve([]);
        const usecase = new FireTimersUsecase(
            instance(timerRepo),
            instance(firingService),
            new LoggerServiceTestImpl(),
        );

        it('does nothing', async () => {
            await usecase.exec('current');
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
            expect(firingService.fire).toBeCalledTimes(10);
            expect(timerRepo.setDone).toBeCalledTimes(5);
            expect(timerRepo.setReFiresAt).toBeCalledTimes(5);
        });
    });
});
