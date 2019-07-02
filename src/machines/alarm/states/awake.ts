import {assign} from 'xstate'

export default {
  entry: assign({
    wakeUp: () => Date.now(),
    sleep: (context: any) => context.goToBed === 0 ? 0 : Date.now() - context.goToBed,
  }),
  on: {
    WORK: 'working',
    SLEEP: 'asleep',
  },
}