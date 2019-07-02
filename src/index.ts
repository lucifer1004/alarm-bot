import * as qrTerm from 'qrcode-terminal'
import {Contact, log, Wechaty} from 'wechaty'
import {interpret} from 'xstate'
import dotenv from 'dotenv'
import {alarmMachine} from './machines'

dotenv.config()

const bot = new Wechaty()
const alarmService = interpret(alarmMachine)
  .onTransition(state => console.info(state.value))
  .start()

bot.on('scan', onScan)
bot.on('login', onLogin)
bot.on('logout', onLogout)
bot.on('message', onMessage)
bot.on('error', onError)

bot.start().catch(console.error)

function onScan(qrcode: any, status: any) {
  qrTerm.generate(qrcode, {small: true}) // show qrcode on console
}

function onLogin(user: Contact) {
  console.info(`${user} login`)
  main()
}

function onLogout(user: Contact) {
  console.info(`${user} logout`)
}

function onMessage(msg: any) {
  const {text}: {text: string} = msg.payload
  if (msg.from().name() !== process.env.SELF) {
    if (text.match(/关闭|退出/)) {
      console.log('您的私人助手即将下线，再见！')
      setTimeout(() => process.exit(), 5000)
    } else if (text.match(/起来|起床/)) alarmService.send('WAKE')
    else if (text.match(/工作|干活/)) alarmService.send('WORK')
    else if (text.match(/休息/)) alarmService.send('REST')
    else if (text.match(/上床|睡觉|晚安/)) alarmService.send('SLEEP')
    else if (text.match(/静音/)) alarmService.send('MUTE')
    else if (text.match(/恢复/)) alarmService.send('UNMUTE')
  }
}

function onError(e: any) {
  console.error(e)
}

async function main() {
  const alice = await bot.Contact.find({name: process.env.ALICE})
  log.info('Bot found:', alice!.id)
  console.log = async function(msg: string) {
    await (alice as Contact).say(msg)
  }
}
