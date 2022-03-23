import { inject, injectable } from 'inversify';
import { TimerRepository } from '../ports/out/timer.repository';
import { FiringService } from '../ports/out/firing.service';
import { Keys } from '../../keys';
import { LoggerService } from '../ports/out/logger.service';

@injectable()
export class FireTimersUsecase {
    constructor(
        @inject(Keys.TimerRepository)
        private readonly timersRepository: TimerRepository,
        @inject(Keys.FiringService)
        private readonly firingService: FiringService,
        @inject(Keys.LoggerService)
        private readonly loggerService: LoggerService,
    ) {}

    public async exec(type: 'current' | 'missed'):Promise<null> {
        const currentTimers = type === 'current'
            ? await this.timersRepository.getNearestTimers(1000)
            : await this.timersRepository.getMissedTimers();
        if (currentTimers.length) this.loggerService.info('found timers', { count: currentTimers.length });
        const currentTimersPromises = [];
        for (const timer of currentTimers) {
            this.loggerService.info('trying to reach', { id: timer.id, url: timer.url });
            currentTimersPromises.push(
                this.firingService.fire(timer.url)
                    .then(() => {
                        this.loggerService.info('timer fired successfully', { id: timer.id });
                        return this.timersRepository.setDone(timer.id);
                    })
                    .catch((error) => {
                        const reFiresAt = new Date(
                            new Date().valueOf() + (timer.reFireDelay * 1000),
                        );
                        this.loggerService.error(
                            'timer fired with fail',
                            error,
                            { id: timer.id, reFiresAt },
                        );
                        return this.timersRepository.setReFiresAt(timer.id, {
                            reFiresAt,
                            reFireDelay: timer.reFireDelay * 2,
                        });
                    }),
            );
        }
        await Promise.all(currentTimersPromises);
        return null;
    }
}
