import {LoggerService} from "../src/domain/ports/out/logger.service";

export class LoggerServiceTestImpl implements LoggerService {
    error(message: string, error: Error, additionalData?: any): void {
        console.error(message, {error, additionalData});
    }

    info(message: string, data: any): void {
        console.log(message, data);
    }

}
