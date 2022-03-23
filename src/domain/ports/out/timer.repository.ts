import { TimerEntity } from '../../entity/timer.entity';

export interface TimerCreateData {
    firesAt: Date,
    url: string
}

export interface TimerRepository {
    getTimer(id: number):Promise<TimerEntity>,
    getNearestTimers(deltaMilliseconds: number):Promise<TimerEntity[]>,
    getMissedTimers():Promise<TimerEntity[]>,
    createTimer(data: TimerCreateData):Promise<TimerEntity>
    setDone(id: number):Promise<null>
    setReFiresAt(id: number, data: { reFiresAt: Date, reFireDelay: number }):Promise<null>
}
