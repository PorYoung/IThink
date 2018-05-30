import md5 from 'md5'
import request from 'superagent'
import config from '../../../config'
import fs from 'fs'
import path from 'path'
const requestPostAsync = (url, form) => {
    return new Promise((resolve, reject) => {
        request
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

const tencent_tts = async (text, saveFlag, options) => {
    let appkey = config.tencent_AppKey
    let time_stamp = Math.round(new Date().getTime() / 1000)
    let params = {
        app_id: config.tencent_AppID,
        speaker: '1',
        format: '3',
        text: text,
        time_stamp: time_stamp,
        nonce_str: 'PorYoung',
        volume: '0',
        speed: '100',
        aht: '0',
        apc: '58'
    }
    if (!!options) {
        Object.assign(params, options)
    }
    let sign = tencent_getReqSign(params, appkey)
    params.sign = sign
    let response = await tencent_doHttpPost(config.tencent_tts_url, params)
    let savePath = '/static/sound/default/'.concat(new Date().getTime).concat('.mp3')
    if(saveFlag){
        savePath = saveFlag
    }
    if (response.ret === 0) {
        if (saveFlag === false) {
            return response.data.speech
        } else {
            fs.createWriteStream(path.join(process.cwd(), savePath)).write(new Buffer(response.data.speech, 'base64'))
            return savePath
        }
    } else {
        console.log(response)
        //return default
    }
}

const xf_tts = async (text, saveName, options) => {
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
    xParam = JSON.stringify(xParam)
    let xParamBase64 = new Buffer(xParam).toString('base64')
    var timestamp = Date.parse(new Date())
    var curTime = timestamp / 1000;
    let checkSum = md5(config.xf_ApiKey_tts + curTime + xParamBase64)
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
    let savePath = '/static/sound/default/'.concat(new Date().getTime).concat('.mp3')
    if(saveName){
        savePath = saveName
    }
    let writeStream = fs.createWriteStream(path.join(process.cwd(), savePath))
    let response = request
        .post(config.xf_tts_url)
        .set(opts.header)
        .send(opts.text)
        .pipe(writeStream)
    return new Promise((resolve,reject)=>{
        writeStream.once('close', () => {
            let stats = fs.statSync(path.join(process.cwd(),savePath))
            if(stats.size < 320){
                resolve('/static/sound/default/error_lost.mp3')
            }else{
                resolve(savePath)
            }
        })
    })
}

const xf_recogn = function (filePath) {
    let timestamp = Date.parse(new Date())
    let curTime = timestamp / 1000
    let xParam = { "auf": "16k", "aue": "raw" }
    xParam = JSON.stringify(xParam)
    let xParamBase64 = new Buffer(xParam).toString('base64')

    //音频文件
    let fileData = fs.readFileSync(filePath)
    let fileBase64 = new Buffer(fileData).toString('base64')

    let xCheckSum = md5(config.xf_ApiKey_recogn + curTime + xParamBase64)
    let opts = {
        headers: {
            "X-Appid": config.xf_AppID,
            "X-CurTime": curTime,
            "X-Param": xParamBase64,
            "X-CheckSum": xCheckSum,
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
    }
    return new Promise((resolve,reject) => {
        request
            .post(config.xf_recogn_url)
            .set(opts.headers)
            .send({audio:fileBase64})
            .end((err,res)=>{
                if(err){
                    reject(err)
                }
                let response = res.text
                try{
                    response = JSON.parse(res.text)
                }catch(e){
                    console.log(e)
                }
                resolve(response)
            })
    })
}

const normalDate = () => {
    let date = new Date()
    let dd = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
    return dd
}

const toQueryDate = (nd) => {
    let queryDate = new Date(nd)
    let nextDate = new Date(queryDate.getTime() + 1000*3600*24)
    return [queryDate,nextDate]
}

export default {
    tencent_tts_maxLength: 32,
    xf_tts_maxLength: 240,
    tencent_tts,
    xf_tts,
    xf_recogn,
    normalDate,
    toQueryDate
}