import 'reflect-metadata';
import { mock } from 'ts-mockito';
import moment from 'moment';
import { SetTimerUsecase } from './set-timer.usecase';
import { LoggerServiceTestImpl } from '../../../test/logger.service.impl';
import { TimerCreateData, TimerRepository } from '../ports/out/timer.repository';

const mockedTimer = {
    id: 1,
    firesAt: new Date(),
    reFiresAt: new Date(),
    reFireDelay: 5,
    done: false,
    url: 'google.com',
};
const timerRepo = mock<TimerRepository>();
timerRepo.createTimer = jest.fn(() => Promise.resolve(mockedTimer));
const usecase = new SetTimerUsecase(timerRepo, new LoggerServiceTestImpl());

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
            const mockArg:TimerCreateData = (timerRepo.createTimer as jest.Mock).mock.calls[0][0];
            expect(mockArg.firesAt.valueOf()).toBeLessThan(nearTimestamp + 50);
            expect(mockArg.firesAt.valueOf()).toBeGreaterThan(nearTimestamp - 50);
        });
    });
});
