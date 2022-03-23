import { injectable } from 'inversify';

const {
    PORT,
    DB_CONNECTION_STRING,
} = process.env;

@injectable()
class Config {
    constructor(
        public port: number = parseInt(PORT || '', 10) || 1333,
        public dbConnection: string = DB_CONNECTION_STRING || 'mongodb://localhost:27017/timers',
    ) {
    }
}

export { Config };
