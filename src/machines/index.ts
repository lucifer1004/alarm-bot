import {Machine, assign} from 'xstate'
import moment from 'moment'
import 'moment/locale/zh-cn'
import ms from 'ms'
import {quotes} from '../assets/fortune'

const periodicActivity = (message: string, timeInterval: number) => (
  context: any,
) => {
  const interval = setInterval(() => {
    if (!context.muted) console.log(message)
  }, timeInterval)
  return () => clearInterval(interval)
}

export const alarmMachine = Machine(
  {
    id: 'alarm',
    initial: 'awake',
    context: {
      muted: false,
      wakeUp: 0,
      goToBed: 0,
      sleep: 0,
      work: 0,
      rest: 0,
      startWork: 0,
      startRest: 0,
    },
    states: {
      awake: {
        entry: assign({
          wakeUp: () => Date.now(),
          sleep: (context: any) => Date.now() - context.goToBed,
        }),
        on: {
          WORK: {
            target: 'working',
            actions: assign({startWork: () => Date.now()}),
          },
        },
      },
      working: {
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
            entry: 'cheer',
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
      },
      rest: {
        entry: assign({startRest: () => Date.now()}),
        exit: assign({
          rest: (context: any) => Date.now() - context.startRest + context.rest,
        }),
        on: {
          SLEEP: 'asleep',
          WORK: 'working',
        },
      },
      asleep: {
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
      },
    },
  },
  {
    actions: {
      showStats: (context: any) => {
        moment.locale('zh-cn')
        console.log(`
          今日总结:
          睡眠时间 ${moment.duration(context.sleep).humanize()}
          起床时间 ${moment(new Date(context.wakeUp)).format('a h:mm:ss')}
          工作 ${moment.duration(context.work).humanize()}
          休息 ${moment.duration(context.rest).humanize()}
        `)
      },
      cheer: (context: any) => {
        if (context.muted) return
        console.log('开始工作，加油💪')
      },
      sayQuote: (context: any) => {
        if (context.muted) return
        const num = 0 | Math.random() * (quotes.length - 1)
        console.log(`${quotes[num].quote}\n————${quotes[num].author}`)
      },
      queryWorkStatus: (context: any) => {
        if (context.muted) return
        console.log(`已经持续工作了${moment.duration(Date.now() - context.startWork).minutes()}分钟，要不要休息一下？`)
      },
    },
    activities: {
      alarm: periodicActivity('起床啦！', ms('15 mins')),
    },
  },
)
