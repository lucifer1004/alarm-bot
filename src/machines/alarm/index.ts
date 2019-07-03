import {Machine, assign} from 'xstate'
import moment from 'moment'
import 'moment/locale/zh-cn'
import ms from 'ms'
import {quotes} from '../../assets/fortune'
import {awake, working, rest, asleep} from './states'

const initialContext = () => ({
  muted: false,
  wakeUp: 0,
  goToBed: 0,
  sleep: 0,
  work: 0,
  rest: 0,
  startWork: 0,
  startRest: 0,
})

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
    context: initialContext(),
    states: {
      awake,
      working,
      rest,
      asleep,
    },
  },
  {
    actions: {
      showStats: context => {
        console.log(`
          今日总结:
          睡眠时间 ${moment.duration(context.sleep).humanize()}
          起床时间 ${moment(new Date(context.wakeUp)).format('a h:mm:ss')}
          工作 ${moment.duration(context.work).humanize()}
          休息 ${moment.duration(context.rest).humanize()}
        `)
      },
      cheerWork: context => {
        if (context.muted) return
        console.log('开始工作，加油💪')
      },
      cheerRest: context => {
        if (!context.muted) console.log('好好休息🛏')
      },
      sayQuote: context => {
        if (!context.muted) {
          const num = 0 | (Math.random() * (quotes.length - 1))
          console.log(`${quotes[num].quote}\n————${quotes[num].author}`)
        }
      },
      queryRestStatus: context => {
        if (!context.muted) {
          const duration = moment.duration(Date.now() - context.startRest)
          console.log(
            `你已经休息了${duration.hours()}小时${duration.minutes()}分钟`,
          )
        }
      },
      queryWorkStatus: context => {
        if (!context.muted) {
          const duration = moment.duration(Date.now() - context.startWork)
          console.log(
            `已经持续工作了${duration.hours()}小时${duration.minutes()}分钟，要不要休息一下？`,
          )
        }
      },
    },
    activities: {
      alarm: periodicActivity('起床啦！', ms('15 mins')),
    },
  },
)
