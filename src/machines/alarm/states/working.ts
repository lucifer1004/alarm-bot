import {assign} from 'xstate'
import ms from 'ms'

export default {
  entry: assign({startWork: () => Date.now()}),
  exit: assign({
    work: (context: any) => Date.now() - context.startWork + context.work,
  }),
  on: {
    SLEEP: 'asleep',
    REST: 'rest',
    MUTE: {
      actions: assign({muted: () => true}),
    },
    UNMUTE: {
      actions: assign({muted: () => false}),
    },
  },
  initial: 'cheer',
  states: {
    cheer: {
      entry: 'cheerWork',
      after: [
        {
          delay: ms('10 mins'),
          target: 'quote',
        },
      ],
    },
    quote: {
      entry: 'sayQuote',
      after: [
        {
          delay: ms('20 mins'),
          target: 'query',
        },
      ],
    },
    query: {
      entry: 'queryWorkStatus',
      after: [
        {
          delay: ms('10 mins'),
          target: 'quote',
        },
      ],
    },
  },
}