import Joi from 'joi';
import { TimerSetData } from '../../domain/usecases/set-timer.usecase';

const setTimerSchema = Joi.object<TimerSetData>({
    url: Joi.string().required(),
    hours: Joi
        .number()
        .integer()
        .required()
        .min(0),
    minutes: Joi
        .number()
        .integer()
        .required()
        .min(0),
    seconds: Joi
        .number()
        .integer()
        .required()
        .min(0),

}).strict();

export { setTimerSchema };
