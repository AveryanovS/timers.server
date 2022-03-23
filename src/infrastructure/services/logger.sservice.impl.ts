import { pino } from 'pino';
import { injectable } from 'inversify';
import { LoggerService } from '../../domain/ports/out/logger.service';

@injectable()
export class LoggerServiceImpl implements LoggerService {
    private readonly logger = pino();

    info(message: string, data: any): void {
        this.logger.info(data, message);
    }

    error(message: string, error: Error, additionalData: any = {}): void {
        this.logger.error({
            error,
            additionalData,
        }, message);
    }
}
