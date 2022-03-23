import 'reflect-metadata';
import {
    anything, capture, instance, mock, when,
} from 'ts-mockito';
import moment from 'moment';
import { SetTimerUsecase } from './set-timer.usecase';
import { LoggerServiceTestImpl } from '../../../test/logger.service.impl';
import { TimerRepository } from '../ports/out/timer.repository';

const mockedTimer = {
    id: 1,
    firesAt: new Date(),
    reFiresAt: new Date(),
    reFireDelay: 5,
    done: false,
    url: 'google.com',
};
const timerRepo = mock<TimerRepository>();
when(timerRepo.createTimer(anything())).thenResolve(mockedTimer);
const usecase = new SetTimerUsecase(instance(timerRepo), new LoggerServiceTestImpl());

describe('set timer', () => {
    describe('1 hr, 1 min, 1s timer', () => {
        it('creates timer with correct timestamp', async () => {
            await usecase.exec({
                hours: 1,
                minutes: 1,
                seconds: 1,
                url: 'http://google.com',
            });
            const nearTimestamp = moment()
                .add(1, 'h')
                .add(1, 'minutes')
                .add(1, 's')
                .toDate()
                .valueOf();
            const [mockArg] = capture(timerRepo.createTimer).last();
            expect(mockArg.firesAt.valueOf()).toBeLessThan(nearTimestamp + 100);
            expect(mockArg.firesAt.valueOf()).toBeGreaterThan(nearTimestamp - 100);
        });
    });
});
