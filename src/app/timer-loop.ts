import { inject, injectable } from 'inversify';
import { FireTimersUsecase } from '../domain/usecases/fire-timers.usecase';
import { LoggerService } from '../domain/ports/out/logger.service';
import { Keys } from '../keys';

@injectable()
export class TimerLoop {
    constructor(
        @inject(FireTimersUsecase)
        private readonly fireCurrentTimersUsecase: FireTimersUsecase,
        @inject(Keys.LoggerService)
        private readonly loggerService: LoggerService,
    ) {
    }

    public start() {
        this.fireCurrentTimersUsecase.exec('missed');
        setInterval(() => {
            this.fireCurrentTimersUsecase.exec('current');
        }, 1000);
        this.loggerService.info('timer loop started', {});
    }
}
