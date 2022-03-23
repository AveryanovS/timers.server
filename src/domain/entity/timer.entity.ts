export interface TimerEntity {
    id: number,
    firesAt: Date,
    url: string,
    reFireDelay: number,
    reFiresAt: Date,
    done: boolean,
}
