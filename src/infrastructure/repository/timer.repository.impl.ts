import { inject, injectable } from 'inversify';
import {
    Model, Schema, Document, LeanDocument,
} from 'mongoose';
import { autoIncrement } from 'mongoose-plugin-autoinc';
import { notFound } from '@hapi/boom';
import { TimerCreateData, TimerRepository } from '../../domain/ports/out/timer.repository';
import { TimerEntity } from '../../domain/entity/timer.entity';
import { Database } from '../db/db';

interface TimerDocument extends Document {
    _id: number,
    firesAt: Date,
    url: string,
    reFireDelay: number,
    reFiresAt: Date,
    done: boolean,
}

function mapDocument(doc: TimerDocument | LeanDocument<TimerDocument>):TimerEntity {
    return {
        id: doc._id,
        firesAt: doc.firesAt,
        url: doc.url,
        reFireDelay: doc.reFireDelay,
        reFiresAt: doc.reFiresAt,
        done: doc.done,
    };
}
@injectable()
export class TimerRepositoryImpl implements TimerRepository {
    private readonly model: Model<TimerDocument>;

    constructor(
    @inject(Database)
        database: Database,
    ) {
        const timerSchema = new Schema({
            _id: {
                type: Number,
            },
            firesAt: {
                type: Date,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
            reFireDelay: { // Seconds adding to next re-fire
                type: Number,
                default: 5,
            },
            reFiresAt: {
                type: Date,
            },
            done: {
                type: Boolean,
                default: false,
            },
        });
        timerSchema.plugin(autoIncrement, 'timer');
        this.model = database.registerModel<TimerDocument>('timer', timerSchema);
    }

    public async createTimer(data: TimerCreateData): Promise<TimerEntity> {
        const created = await new this.model({
            url: data.url,
            firesAt: data.firesAt,
        }).save();
        return mapDocument(created);
    }

    public async getTimer(id: number): Promise<TimerEntity> {
        const found = await this.model.findOne({ _id: id }).lean();
        if (!found) throw notFound('Timer not found');
        return mapDocument(found);
    }

    public async getNearestTimers(deltaMilliseconds: number): Promise<TimerEntity[]> {
        const found = await this.model.find({
            $or: [
                {
                    firesAt: {
                        $gte: new Date(),
                        $lte: new Date(new Date().valueOf() + deltaMilliseconds),
                    },
                },
                {
                    reFiresAt: {
                        $gte: new Date(),
                        $lte: new Date(new Date().valueOf() + deltaMilliseconds),
                    },
                },
            ],
        }).lean();
        return found.map(mapDocument);
    }

    setReFiresAt(id: number, data: { reFiresAt: Date; reFireDelay: number }): Promise<null> {
        return this.model.updateOne(
            { _id: id },
            { $set: { reFiresAt: data.reFiresAt, reFireDelay: data.reFireDelay } },
        ).then(() => null);
    }

    setDone(id: number): Promise<null> {
        return this.model.updateOne({ _id: id }, { $set: { done: true } }).then(() => null);
    }

    async getMissedTimers(): Promise<TimerEntity[]> {
        const found = await this.model.find({
            done: false,
            $or: [
                {
                    firesAt: { $lte: new Date() },
                },
                {
                    reFiresAt: { $lte: new Date() },
                },
            ],

        }).lean();
        return found.map(mapDocument);
    }
}
