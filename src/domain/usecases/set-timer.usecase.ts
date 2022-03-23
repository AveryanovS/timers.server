import { inject, injectable } from 'inversify';
import { TimerRepository } from '../ports/out/timer.repository';
import { Keys } from '../../keys';
import { MILLISECONDS_IN_SECOND } from '../const/const';
import { LoggerService } from '../ports/out/logger.service';

interface TimerSetData {
    hours: number,
    minutes: number,
    seconds: number,
    url: string,
}

@injectable()
export class SetTimerUsecase {
    constructor(
        @inject(Keys.TimerRepository)
        private readonly timerRepository: TimerRepository,
        @inject(Keys.LoggerService)
        private readonly loggerService: LoggerService,
    ) {
    }

    public async exec(data: TimerSetData):Promise<{ id: number }> {
        const firesAt = new Date(
            new Date().valueOf()
            + (MILLISECONDS_IN_SECOND * data.seconds)
            + (MILLISECONDS_IN_SECOND * 60 * data.minutes)
            + (MILLISECONDS_IN_SECOND * 60 * 60 * data.hours),
        );
        const timer = await this.timerRepository.createTimer({
            firesAt,
            url: data.url,
        });
        this.loggerService.info('new timer set', timer);
        return { id: timer.id };
    }
}
