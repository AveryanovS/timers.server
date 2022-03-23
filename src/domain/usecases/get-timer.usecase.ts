import { inject, injectable } from 'inversify';
import { Keys } from '../../keys';
import { TimerRepository } from '../ports/out/timer.repository';

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
        let timeLeft = Math.floor((timer.firesAt.valueOf() - new Date().valueOf()) / 1000);
        if (timeLeft < 0) timeLeft = 0;
        return Promise.resolve({
            id,
            timeLeft,
        });
    }
}
