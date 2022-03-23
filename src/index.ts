import { container } from './inversify.config';
import { Server } from './app/server';
import { TimerLoop } from './app/timer-loop';

const server = container.get(Server);
server.run();

const loop = container.get(TimerLoop);
loop.start();
