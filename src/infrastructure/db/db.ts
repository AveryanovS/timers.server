import mongoose, { Model, Schema, Document } from 'mongoose';
import { inject, injectable } from 'inversify';
import { Config } from '../../config';
import { LoggerService } from '../../domain/ports/out/logger.service';
import { Keys } from '../../keys';

@injectable()
export class Database {
    private readonly mongoose: mongoose.Mongoose;

    constructor(
    @inject(Config) config: Config,
        @inject(Keys.LoggerService)
        private readonly loggerService: LoggerService,
    ) {
        this.mongoose = new mongoose.Mongoose();

        const connectionString = config.dbConnection;

        this.mongoose.connect(connectionString);
        this.mongoose.connection.on('connected', () => {
            this.loggerService.info('connected to mongo db', { connectionString });
        });
        this.mongoose.connection.on('error', (error) => {
            this.loggerService.error('mongoose connection error', error);
            process.exit(1);
        });
    }

    registerModel<T extends Document>(name: string, schema: Schema): Model<T> {
        return this.mongoose.model<T>(name, schema);
    }
}
