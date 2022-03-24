import { inject, injectable } from 'inversify';
import express, { Application } from 'express';
import { boomify, isBoom, notFound } from '@hapi/boom';
import { SetTimerUsecase } from '../domain/usecases/set-timer.usecase';
import { GetTimerUsecase } from '../domain/usecases/get-timer.usecase';
import { Config } from '../config';
import { Keys } from '../keys';
import { LoggerService } from '../domain/ports/out/logger.service';
import { setTimerSchema } from './validation/set-timer';

@injectable()
export class Server {
    private app: Application;

    private port: number;

    constructor(
        @inject(SetTimerUsecase)
        private readonly setTimerUsecase: SetTimerUsecase,
        @inject(GetTimerUsecase)
        private readonly getTimerUsecase: GetTimerUsecase,
        @inject(Config)
        config: Config,
        @inject(Keys.LoggerService)
        private readonly loggerService: LoggerService,
    ) {
        this.port = config.port;
        this.app = express();
        this.app.use(express.json());

        this.app.post('/timers', (req, res, next) => {
            const { error, value } = setTimerSchema.validate(req.body);
            if (error) return next(error);
            this.setTimerUsecase.exec(value)
                .then((result) => res.json(result))
                .catch((err) => next(err));
        });

        this.app.get('/timers/:id', (req, res, next) => {
            this.getTimerUsecase.exec(parseInt(req.params.id, 10))
                .then((result) => res.json({
                    id: result.id,
                    time_left: result.timeLeft,
                }))
                .catch((err) => next(err));
        });
        this.app.use((_req, _res, next) => {
            next(notFound('url not found'));
        });

        this.app.use((err: any, req: any, res: any, _next: any) => {
            this.loggerService.error('error', err);
            if (err.details) { // Joi validation error
                const message = err.details.reduce(
                    (prev:string, cur:{ message:string }) => `${prev + cur.message}; `,
                    '',
                );
                return res.status(400).json({
                    message,
                    data: err.details,
                });
            }

            const data = err.data || {};
            if (!isBoom(err)) {
                err = boomify(err);
                err.message = 'internal server error';
            }

            err.output.payload.data = data;
            return res.status(err.output.statusCode).json({
                message: err.message,
                data: err.output.payload.data || {},
            });
        });
    }

    public run():void {
        this.app.listen(this.port, () => {
            this.loggerService.info('server started', { port: this.port });
        });
    }

    public getApp():Application {
        return this.app;
    }
}
