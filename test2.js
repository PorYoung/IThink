let request = require('request')
let request2 = require('superagent')
let formidable = require('formidable')
let express = require('express')
let app = express();
let http = require('http')
let fs = require('fs')
let server = http.createServer(app)
let md5 = require('md5')
let path = require('path')
let ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
// let ffmpeg = require('fluent-ffmpeg');
let ffmpeg = require('fluent-ffmpeg')
const config = {
    tencent_AppID: '1106804023',
    tencent_AppKey: 'sDHxFtm0T1m73OIs',
    tencent_tts_url: 'https://api.ai.qq.com/fcgi-bin/aai/aai_tts',
    xf_AppID: '5ae1a9f9',
    xf_ApiKey: '6733d5457c5d383dc315841181589b36',
    xf_hostname: 'api.xfyun.cn',
    xf_tts_path: '/v1/service/v1/tts'
}
server.listen(3000);
app.use('/static', express.static('./static'))

ffmpeg.setFfmpegPath(ffmpegPath);

const requestAsync = function (opts) {
    return new Promise(function (resolve, reject) {
        request(opts, function (error, response, body) {
            if (error) return reject(error)
            resolve({
                response,
                body
            })
        })
    })
}

const requestPostAsync = function (url, form) {
    return new Promise(function (resolve, reject) {
        // request.post({
        //     url,
        //     form: form
        // }, function (error, response, body) {
        //     if (error) return reject(error)
        //     resolve({
        //         response,
        //         body
        //     })
        // })
        request2
            .post(url)
            .type('form')
            .send(form)
            .end((err, res) => {
                if (err) {
                    reject(err)
                }
                resolve(res)
            })
    })
}
const tencent_getReqSign = (params, appkey) => {
    let keys = Object.keys(params).sort()
    let str = ''
    for (let i in keys) {
        let k = keys[i]
        let v = params[k]
        str += k + '=' + encodeURI(v) + '&'
    }
    str += 'app_key=' + appkey
    return md5(str).toUpperCase()
}

const tencent_doHttpPost = async (url, params) => {
    let result = await requestPostAsync(url, params)
    return result.body
}

const xf_ttsRequest = function (opts) {
    let postData = encodeURI(opts.text)
    let options = {
        hostname: config.xf_hostname,
        port: 80,
        path: config.xf_tts_path,
        method: 'POST',
        headers: opts.header
    }
    return new Promise(function (resolve, reject) {
        let wOption = {
            flags: 'a',
            encoding: null,
            mode: 0o666
        }
        let fileWriteStream = fs.createWriteStream(path.join(path.join(process.cwd(), 'static/voice/default/4.mp3')), wOption)
        let req = http.request(options, function (res) {
            res.setEncoding('utf-8')
            let status = res.headers
            console.log(status)
            res.on('data', function (data) {
                fileWriteStream.write(data)
                // resolve(data)
            })
            res.on('end', () => {
                fileWriteStream.end()
                resolve('static/voice/default/4.mp3')
            })
        })
        req.on('err', function (err) {
            consloe.log(err)
            reject(err)
        })
        req.write(postData)
        req.end()
    })
}

const request2Async = function (opts) {
    return new Promise(function (resolve, reject) {
        request2
            .post('http://api.xfyun.cn/v1/service/v1/tts')
            .set(opts.header)
            .send(opts.text)
            .end(function (err, res) {
                if (err) {
                    reject(err)
                }
                resolve(res)
            })
    })
}
const xf_tts = (text, options) => {
    let xParam = {
        "auf": "audio/L16;rate=16000",
        "aue": "lame",
        "voice_name": "xiaoyan",
        "speed": "50",
        "volume": "50",
        "pitch": "50",
        "engine_type": "intp65",
        "text_type": "text"
    }
    if (!!options) {
        Object.assign(xParams, options)
    }
    xParam = JSON.stringify(xParam);
    let xParamBase64 = new Buffer(xParam).toString('base64')
    var timestamp = Date.parse(new Date());
    var curTime = timestamp / 1000;
    let checkSum = md5(config.xf_ApiKey + curTime + xParamBase64)
    let opts = {
        header: {
            "X-Appid": config.xf_AppID,
            "X-CurTime": curTime,
            "X-Param": xParamBase64,
            "X-CheckSum": checkSum,
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        },
        text: 'text=' + text
    }
    // let response = await xf_ttsRequest(opts)
    // let response = await requestAsync({url:'http://api.xfyun.cn/v1/service/v1/tts',method:'POST',headers:opts.header,form:encodeURI(opts.text)})
    // console.log(response.response.headers)
    // return response
    // await fs.createWriteStream(path.join(process.cwd(), 'static/voice/default/5.mp3')).write(response)
    // await request({url:'http://api.xfyun.cn/v1/service/v1/tts',method:'POST',headers:opts.header,form:encodeURI(opts.text)}).pipe(fs.createWriteStream(path.join(process.cwd(), 'static/voice/default/5.mp3')))
    // let response = await request2Async(opts)
    let res = request2.post('http://api.xfyun.cn/v1/service/v1/tts').set(opts.header).send(opts.text)
    return res
}

app.get('/', async (req, res) => {
    let result = await requestPostAsync('http://localhost:3000/post', {
        appkey: '123',
        sign: 'asdaadas'
    })
    fs.createWriteStream('baidu.html').write(result.body);
    res.send(result.body);
})

app.get('/speech', async (req, res) => {
    let appkey = 'sDHxFtm0T1m73OIs'
    let time_stamp = Math.round(new Date().getTime() / 1000)
    let params = {
        app_id: '1106804023',
        speaker: '1',
        format: '3',
        text: '我在时光里莅住，期待，在每一个风轻云淡的日子里，可以写出锦瑟生香的暖字。哈哈哈哈',
        time_stamp: time_stamp,
        nonce_str: 'PorYoung',
        volume: '0',
        speed: '100',
        aht: '0',
        apc: '58'
    }
    let sign = tencent_getReqSign(params, appkey)
    params.sign = sign
    let response = await tencent_doHttpPost('https://api.ai.qq.com/fcgi-bin/aai/aai_tts', params)
    let writeStream = fs.createWriteStream(path.join(process.cwd(), 'static/voice/default/1.mp3'))
    writeStream.write(new Buffer(response.data.speech, 'base64'))
    return res.send('<div>ok</div><audio src="/static/voice/default/1.mp3" autoplay loop></audio>')
})

app.get('/speech2', async (req, res) => {
    // let response = await xf_tts('今天是个好日子')
    // await fs.createWriteStream(path.join(process.cwd(), 'static/voice/default/4.mp3')).write(response.body)
    // res.send(response)
    let response = xf_tts('都说最美人间四月天，而我最愿，不管后来的以后我会变得如何如何，唯愿你曾经在我心上莅住过的痕迹还在，就算老了花期，旧了容颜，远了思念，岁月里的相望依旧还有当初的温度。')
    response
        .pipe(fs.createWriteStream(path.join(process.cwd(), 'static/voice/default/1.mp3')))
        .once('close', function () {
            return res.send('<div>ok</div><audio src="/static/voice/default/1.mp3" autoplay loop></audio>')
        })
})