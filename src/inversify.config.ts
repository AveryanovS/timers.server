import 'reflect-metadata';
import { Container } from 'inversify';
import { Server } from './app/server';
import { SetTimerUsecase } from './domain/usecases/set-timer.usecase';
import { GetTimerUsecase } from './domain/usecases/get-timer.usecase';
import { TimerRepository } from './domain/ports/out/timer.repository';
import { Keys } from './keys';
import { TimerRepositoryImpl } from './infrastructure/repository/timer.repository.impl';
import { Database } from './infrastructure/db/db';
import { Config } from './config';
import { FiringService } from './domain/ports/out/firing.service';
import { FiringServiceImpl } from './infrastructure/services/firing.service.impl';
import { LoggerService } from './domain/ports/out/logger.service';
import { LoggerServiceImpl } from './infrastructure/services/logger.service.impl';
import { TimerLoop } from './app/timer-loop';
import { FireTimersUsecase } from './domain/usecases/fire-timers.usecase';

const container = new Container();

container.bind<Server>(Server).toSelf().inSingletonScope();
container.bind<TimerLoop>(TimerLoop).toSelf().inSingletonScope();
container.bind<SetTimerUsecase>(SetTimerUsecase).toSelf().inSingletonScope();
container.bind<GetTimerUsecase>(GetTimerUsecase).toSelf().inSingletonScope();
container.bind<FireTimersUsecase>(FireTimersUsecase).toSelf().inSingletonScope();
container.bind<Database>(Database).toSelf().inSingletonScope();
container.bind<Config>(Config).toSelf().inSingletonScope();
container.bind<TimerRepository>(Keys.TimerRepository).to(TimerRepositoryImpl).inSingletonScope();
container.bind<FiringService>(Keys.FiringService).to(FiringServiceImpl).inSingletonScope();
container.bind<LoggerService>(Keys.LoggerService).to(LoggerServiceImpl).inSingletonScope();

export { container };
