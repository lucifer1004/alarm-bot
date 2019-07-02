import {interpret} from 'xstate'
import {alarmMachine} from '../machines'

const alarmService = interpret(alarmMachine)
  .onTransition(state => {
    console.log(state.value)
  })
  .start()

const stdin = process.stdin

stdin.resume()
stdin.setEncoding('utf8')

stdin.on('data', (text: string) => {
  // ctrl-c
  if (text.match(/关闭|退出/)) {
    console.log('您的私人助手即将下线，再见！')
    setTimeout(() => process.exit(), 5000)
  } else if (text.match(/起来|起床/)) alarmService.send('WAKE')
  else if (text.match(/工作|干活/)) alarmService.send('WORK')
  else if (text.match(/休息/)) alarmService.send('REST')
  else if (text.match(/上床|睡觉|晚安/)) alarmService.send('SLEEP')
  else if (text.match(/静音/)) alarmService.send('MUTE')
  else if (text.match(/恢复/)) alarmService.send('UNMUTE')
})
