import 'reflect-metadata';
import { mock } from 'ts-mockito';
import moment from 'moment';
import { TimerRepository } from '../ports/out/timer.repository';
import { GetTimerUsecase } from './get-timer.usecase';

const secondsTillTimer = 645;
const mockedTimer = {
    id: 1,
    firesAt: moment().add(secondsTillTimer, 'seconds').toDate(),
    reFiresAt: new Date(),
    reFireDelay: 5,
    done: false,
    url: 'google.com',
};
const timerRepo = mock<TimerRepository>();
timerRepo.getTimer = jest.fn(() => Promise.resolve(mockedTimer));
const usecase = new GetTimerUsecase(timerRepo);

describe('get timer', () => {
    describe('getting mocked timer', () => {
        it('returns correct amount of seconds left', async () => {
            const result = await usecase.exec(1);
            expect(result.timeLeft).toEqual(secondsTillTimer);
        });
    });
});
