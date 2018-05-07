import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import xmlparser from 'express-xml-bodyparser'
import router from './router' //api
import db from './common/mongoose' //数据库连接句柄
import http from 'http'
import myUtils from './common/utils'
import path from 'path'

// 设置为全局数据库连接句柄
global.db = db

const app = express()
const server = http.createServer(app)
server.listen(3000)

app.use(bodyParser.urlencoded({
	extended: true
}))
app.use(bodyParser.json())
app.use(xmlparser())

// cookie、session配置
app.use(session({
	secret: 'PorYoung',
	cookie: {
		maxAge: 60 * 1000 * 30
	},
	resave: false,
	saveUninitialized: true,
}))

//指定模板位置
app.set('views', __dirname + '/views')

app.use(router)

app.get('/tts',(req,res)=>{
    res.send('<a href="/speech_tencent">Tencent Test!</a><br><a href="/speech_xf">XF Test</a>')
})
app.get('/speech_tencent',async (req,res)=>{
	let saveName = '2.mp3'
	let savePath = await myUtils.tencent_tts('哈哈哈哈，哈哈哈哈，腾讯TTS测试没有问题',saveName,{speaker:5})
	return res.send(`<audio src="${savePath}" autoplay loop></audio>`)
})

app.get('/speech_xf',async (req,res)=>{
	let saveName = '3.mp3'
	let savePath = await myUtils.xf_tts('我靠，什么鬼异步逻辑，我的Promise全部await还一大堆错误，去你的nodejs',saveName)
	return res.send(`<audio src="${savePath}" autoplay loop></audio>`)
})

module.exports = app