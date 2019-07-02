import {assign} from 'xstate'
import ms from 'ms'

export default {
  entry: [assign({goToBed: () => Date.now()}), 'showStats'],
  exit: assign({
    wakeUp: () => 0,
    work: () => 0,
    rest: () => 0,
    startWork: () => 0,
    startRest: () => 0,
  }),
  on: {
    WAKE: 'awake',
  },
  initial: 'stopped',
  states: {
    stopped: {
      on: {
        SET_ALARM: 'set',
      },
      after: [
        {
          delay: ms('7 hrs'),
          target: 'set',
        },
      ],
    },
    set: {
      on: {
        STOP_ALARM: 'stopped',
      },
      activities: ['alarm'],
    },
  },
}