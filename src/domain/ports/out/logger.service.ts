export interface LoggerService {
    info(message: string, data: any):void,
    error(message: string, error: Error, additionalData?: any):void,
}
