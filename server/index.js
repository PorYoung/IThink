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
	let items = [
		['提示，在历史想法页面，左右滑动查看前一天或后一天的想法','help_9.mp3']
	]
	for(let i = 0;i < items.length;i++){
		let p = path.join('/static/sound/default',items[i][1])
		await myUtils.tencent_tts(items[i][0],p,{speaker:7})
	}
	// await myUtils.tencent_tts('提示，进入今日推荐页面','index_alert_welcome3.mp3',{speaker:7})
	// return res.send(`<audio src="${savePath}" autoplay loop></audio>`)
	return res.send('ok')
})

app.get('/speech_xf',async (req,res)=>{
	let saveName = 'xf_test.mp3'
	let savePath = await myUtils.xf_tts('人生在世，若不能疯狂一次，当埋入黄土之时又如何能够甘心。\n来自大山的孩子，怀揣着梦想，并始终坚持着，多少人仿佛看到了年轻的自己？',saveName)
	return res.send(`<audio src="${savePath}" autoplay loop></audio>`)
})

module.exports = app