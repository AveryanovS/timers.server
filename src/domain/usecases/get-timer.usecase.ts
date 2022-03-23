import { inject, injectable } from 'inversify';
import { Keys } from '../../keys';
import { TimerRepository } from '../ports/out/timer.repository';
import { MILLISECONDS_IN_SECOND } from '../const/const';

interface TimeLeft {
    id: number,
    timeLeft: number
}

@injectable()
export class GetTimerUsecase {
    constructor(
        @inject(Keys.TimerRepository)
        private readonly timerRepository: TimerRepository,
    ) {
    }

    public async exec(id: number):Promise<TimeLeft> {
        const timer = await this.timerRepository.getTimer(id);
        let timeLeft = Math.ceil(
            (timer.firesAt.valueOf() - new Date().valueOf()) / MILLISECONDS_IN_SECOND,
        );
        if (timeLeft < 0) timeLeft = 0;
        return Promise.resolve({
            id,
            timeLeft,
        });
    }
}
