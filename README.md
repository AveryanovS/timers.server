## Timers api
Hiring task for backend developer due to [requirements](requirements.pdf)

### usage
1. ```npm install```
2. ```npm run dev``` for running just the api process. Requires mongo instance and the url provided via the `DB_CONNECTION_STRING` env 
3. ```cd deploy; docker-compose up -d``` for running the full system, including a mongo instance
---
Logs are being printed in json format by pino.js. For better readability, I recommend piping them `| pino-pretty` or using `npm run dev_pretty`, it's included here
### details
* Created with DDD principle; core in `./src/domain`
* Covered by tests, ```npm test``` for unit tests,  ```npm test:e2e``` for e2e
* OpenAPI  [docs](docs/api.yaml)
### notes
* Server can handle big amount of timers, but in this implementation big amount 
of timers, _firing at one time_ can cause issues. In this case I would make
solution with pagination on current timers query.
