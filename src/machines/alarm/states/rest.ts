import {assign} from 'xstate'
import ms from 'ms'

export default {
  entry: assign({startRest: () => Date.now()}),
  exit: assign({
    rest: (context: any) => Date.now() - context.startRest + context.rest,
  }),
  on: {
    SLEEP: 'asleep',
    WORK: 'working',
  },
  initial: 'start',
  states: {
    start: {
      entry: 'cheerRest',
      after: [
        {
          delay: ms('15 mins'),
          target: 'timer',
        },
      ],
    },
    timer: {
      entry: 'queryRestStatus',
      after: [
        {
          delay: ms('15 mins'),
          target: 'timer',
        },
      ],
    },
  },
}