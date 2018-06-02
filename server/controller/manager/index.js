 import path, { resolve } from 'path'
 import md5 from 'md5'
 import formidable from 'formidable'
 import fs from 'fs'
 import myUtils from '../../common/utils'
 export default class{
    static async page_index(req,res){
        // let query = await db.recommendation.findOne({})
        res.redirect('/login')
    }

    static async page_login(req,res){
        if(req.session.userid){
            return res.redirect('/management')
        }
        return res.sendFile(path.join(process.cwd(),'/server/views/login.html'))
    }

    static async page_management(req,res){
        if(req.session.userid){
            return res.sendFile(path.join(process.cwd(),'/server/views/management.html'))
        }else{
            return res.redirect('/login')
        }
    }

    static async fun_login(req,res){
        let {username,password} = req.body
        if(!username || !password){
            return res.send('-3')
        }
        let managerInfo = await db.manager.findOne({username:username})
        if(!managerInfo){
            return res.send('-1')
        }
        password = md5(password.concat(username))
        if(managerInfo.password==password){
            req.session.userid = managerInfo._id.toString()
            return res.send('1')
        }else{
            return res.send('-2')
        }
    }

    static async fun_uploadRecommendation(req,res){
        let form = new formidable.IncomingForm()
        let coverPath = ''
        let filePath = ''
        let fields = {}
        let type = ''
        let date = new Date()

        form.uploadDir = path.join(process.cwd(),'/static/temp')
        form.maxFileSize = 20 * 1024 * 1024
        form.parse(req)
        form.on('field', (name, value) => {
            if(name === 'type'){
                type = value
            }else if(name === 'date'){
                date = value
            }else{
                fields[name] = value
            }
        })
        form.on('fileBegin',(name,file) => {
            let type = file.type.split('/')[1].toLowerCase()
            let filename = md5(file.name.concat(new Date().getTime())).concat('.').concat(type)
            file.name = filename
            if(type === 'mp3'|| type === 'wav'){
                filePath =  path.join('/static/sound/music/',filename)
                file.path = path.join(process.cwd(),filePath)
            }else{
                coverPath = path.join('/static/image/cover/',filename)
                file.path = path.join(process.cwd(),coverPath)
            }
        })
        form.on('end',async() => {
            //fetch sound
            let _id = new db.ObjectId()
            let fragments = []
            let detail = {}
            let Reg = new RegExp("/[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]/g")
            for(let key in fields){
                if(fields.hasOwnProperty(key)){
                    if(key.includes('title')){
                        fields[key] = fields[key].substring(0,myUtils.tencent_tts_maxLength)
                        let filePath = path.join('/static/sound/recommendation',_id.toString()+'_title.mp3')
                        fragments[0] = await myUtils.tencent_tts('标题，'.concat(fields[key].replace(Reg,'')),filePath)
                    }else if(key.includes('content')){
                        let contentStr = fields[key].replace(/\r|\n|\s/g,'')
                        let len = contentStr.length
                        let idx = 3
                        while(len > myUtils.xf_tts_maxLength){  
                            let filePath = path.join('/static/sound/recommendation',_id.toString()+'_'+idx+'.mp3')
                            len -= myUtils.xf_tts_maxLength
                            let start = (idx - 3) * myUtils.xf_tts_maxLength
                            let end = start + myUtils.xf_tts_maxLength
                            let text = contentStr.substring(start,end)
                            if(idx === 3){
                                text = '主要内容，'.concat(text)
                            }
                            console.log(text)
                            fragments[idx] = await myUtils.xf_tts(text,filePath)
                            console.log(fragments[idx])
                            ++idx
                        }
                        let filePath = path.join('/static/sound/recommendation',_id.toString()+'_'+idx+'.mp3')
                        let start = (idx - 3) * myUtils.xf_tts_maxLength
                        let end = start + myUtils.xf_tts_maxLength
                        let text = contentStr.substring(start,end)
                        fragments[idx] = await myUtils.xf_tts(text,filePath)
                    }else if(key.includes('coverUrl')){
                        if('' !== coverPath){
                            if('' === fields[key]){
                                fields[key] = coverPath
                            }else{
                                fs.unlinkSync(path.join(process.cwd(),coverPath))
                            }
                        }
                    }
                }
            }
            if(type === 'music' && '' !== filePath && '' === fields.musicUrl){
                fields.musicUrl = filePath
            }
            Object.assign(detail,fields)
            //author tts            
            let managerPath = path.join('/static/sound/manager',req.session.userid.concat('.mp3'))
            let stat
            try{
                stat = fs.statSync(path.join(process.cwd(),managerPath))
            }catch(e){
                let query = await db.manager.findOne({_id:db.ObjectId(req.session.userid)})
                if(query){
                    let name = query.username
                    let text = '编辑，'.concat(name.replace(Reg,''))
                    fragments[1] = await myUtils.tencent_tts(text,managerPath)
                }else{
                    //return default error
                    fragments[1] = '/static/sound/default/error_lost.mp3'
                }
            }
            if(stat){
                fragments[1] = managerPath
            }
            //date tts
            let dd = date.split('-')
            if(dd[1][0] === '0'){
                date = dd[0] + '-' + dd[1][1] + '-' + dd[2]
            }
            let datePath = path.join('/static/sound/date',date+'.mp3')
            stat = undefined
            try{
                stat = fs.statSync(path.join(process.cwd(),datePath))
            }catch(e){
                let text = '日期，'.concat(date.replace(/-/g,'.'))
                fragments[2] = await myUtils.tencent_tts(text,datePath)
            }
            if(stat){
                fragments[2] = datePath
            }
            let dbData = await db.recommendation.create({
                _id: _id,
                type: type,
                manager: req.session.userid,
                detail: detail,
                soundFragments: fragments,
                date: date,
                uploadDate: new Date()
            })            
            return res.send('1')
        })
        form.on('error', (err) => {
            return res.send('-1')
        })
    }
}