import myUtils from '../../common/utils'
import path, { resolve } from 'path'
import fs from 'fs'
import ffmpeg from 'fluent-ffmpeg'
export default class {
    static async getTodayRecommendation(req, res) {
        let user_id = req.query.user_id
        if (user_id) {
            user_id = db.ObjectId(user_id)
        } else {
            return res.send('-1')
        }
        let today = myUtils.normalDate()
        let recoms = await db.recommendation.findOne({
            date: today,
            users: user_id
        })
        if (recoms) {
            let managerInfo = await db.manager.findOne({
                _id: recoms.manager
            }, {
                username: 1
            })
            if (managerInfo) {
                let data = recoms._doc
                Object.assign(data, {
                    managerUsername: managerInfo.username
                })
                return res.send(data)
            }
        }
        recoms = await db.recommendation.find({
            date: today
        })
        if (recoms && recoms.length > 0) {
            let len = recoms.length
            let idx = 0
            if (len > 1) {
                idx = Math.floor(Math.random() * len)
                if (idx >= len) {
                    idx = len - 1
                }
            }
            let tdRec = recoms[idx]
            tdRec = await db.recommendation.findOneAndUpdate({
                _id: tdRec._id
            }, {
                $push: {
                    users: user_id
                }
            }, {
                new: true
            })
            if (tdRec) {
                let managerInfo = await db.manager.findOne({
                    _id: tdRec.manager
                }, {
                    username: 1
                })
                if (managerInfo) {
                    let data = tdRec._doc
                    Object.assign(data, {
                        managerUsername: managerInfo.username
                    })
                    return res.send(data)
                }
            }
        }
        return res.send('-1')
    }

    static async getRecommendation(req,res){
        let {rec_id,user_id,date} = req.query
        if(rec_id){
            let rec = await db.recommendation.findOne({_id:db.ObjectId(rec_id)})
            if(rec){
                return res.send(rec._doc)
            }
        }else if(user_id && date){
            let queryDate = myUtils.toQueryDate(date)
            let rec = await db.recommendation.findOne({users:db.ObjectId(user_id),date: {'$gte': queryDate[0], '$lt': queryDate[1]}})
            if(rec){
                return res.send(rec._doc)
            }
        }
        return res.send('-1')
    }

    static async getHistory(req,res){
        let {user_id,date} = req.query
        if(user_id && date){
            let queryDate = myUtils.toQueryDate(date)
            let idea = await db.idea.findOne({author:db.ObjectId(user_id),date: {'$gte': queryDate[0], '$lt': queryDate[1]}})
            if(idea){
                let rec_id = idea.recommendation
                let recommendation = await db.recommendation.findOne({_id:rec_id})
                if(recommendation){
                    let managerInfo = await db.manager.findOne({_id: recommendation.manager}, {username: 1})
                    recommendation = recommendation._doc
                    if (managerInfo) {
                        Object.assign(recommendation, {
                            managerUsername: managerInfo.username
                        })
                    }
                    return res.send({
                        idea: idea._doc,
                        recommendation: recommendation
                    })
                }else{
                    return res.send({
                        idea: idea._doc
                    })
                }
            }
        }
        return res.send('-1')
    }

    static async randomIdea(req,res){
        let{date,user_id,lastIdeaId} = req.query
        if(date){
            let queryDate = myUtils.toQueryDate(date)
            let idea
            let loop = 3
            while(loop--){
                let rand = Math.random()
                idea = await db.idea.findOne({date: {$gte: queryDate[0], $lt: queryDate[1]},random:{$lt:rand}})
                if(idea === null){
                    idea = await db.idea.findOne({date: {$gte: queryDate[0], $lt: queryDate[1]},random:{$gte:rand}})
                }
                if(idea){
                    if(!lastIdeaId || idea._id.toString() != lastIdeaId){
                        break
                    }
                }else{
                    break
                }
            }
            if(idea){
                //if the user like this idea
                let inLikes = idea.likes.indexOf(db.ObjectId(user_id))
                inLikes = inLikes!=-1?true:false
                idea = idea._doc
                idea.inLikes = inLikes
                let userInfo = await db.user.findOne({_id:idea.author})
                if(userInfo){
                    let nickName = userInfo.nickName
                    let authorAvatar = userInfo.avatarUrl
                    Object.assign(idea,{
                        authorNickName: nickName,
                        authorAvatar: authorAvatar
                    })
                }else{
                    //该用户走丢了
                }
                if(loop <= 0){
                    idea.loopOver = true
                }
                let rec_id = idea.recommendation
                let recommendation = await db.recommendation.findOne({_id:rec_id})
                if(recommendation){
                    let managerInfo = await db.manager.findOne({_id: recommendation.manager}, {username: 1})
                    recommendation = recommendation._doc
                    if (managerInfo) {
                        Object.assign(recommendation, {
                            managerUsername: managerInfo.username
                        })
                    }
                    return res.send({
                        idea: idea,
                        recommendation: recommendation
                    })
                }else{
                    return res.send({
                        idea: idea
                    })
                }
            }
        }
        return res.send('-1')
    }

    static async ideaInLikes(req,res){
        let {idea_id,user_id} = req.query
        if(idea_id){
            let idea = await db.idea.findOne({_id:db.ObjectId(idea_id),likes:db.ObjectId(user_id)})
            if(idea){
                //remove
                idea = await db.idea.findOneAndUpdate({_id:db.ObjectId(idea_id)},{$pull:{likes:db.ObjectId(user_id)},$inc:{points:-1}},{new:true})
                author = await db.user.findOneAndUpdate({_id:idea.author},{$inc:{points:-1}})
            }else{
                //push
                idea = await db.idea.findOneAndUpdate({_id:db.ObjectId(idea_id)},{$push:{likes:db.ObjectId(user_id)},$inc:{points:1}},{new:true})
                author = await db.user.findOneAndUpdate({_id:idea.author},{$inc:{points:1}})
            }
            if(idea){
                let inLikes = idea.likes.indexOf(db.ObjectId(user_id))
                return res.send({
                    points: idea.points,
                    inLikes: inLikes
                })
            }
        }
        return res.send('-1')
    }

    static async getFavorite(req,res){
        let {user_id,date,category} = req.query
        if(user_id&&category){
            if(category==='date'&&date){
                let queryDate = myUtils.toQueryDate(date)
                let ideaArr = await db.idea.find({likes:db.ObjectId(user_id),date: {'$gte': queryDate[0], '$lt': queryDate[1]}})
                if(ideaArr && ideaArr.length > 0){
                    let favArr = []
                    for(let i = 0;i < ideaArr.length;i++){
                        let idea = ideaArr[i]._doc
                        let userInfo = await db.user.findOne({_id:idea.author})
                        if(userInfo){
                            let nickName = userInfo.nickName
                            let authorAvatar = userInfo.avatarUrl
                            Object.assign(idea,{
                                authorNickName: nickName,
                                authorAvatar: authorAvatar
                            })
                        }
                        let rec_id = idea.recommendation
                        let recommendation = await db.recommendation.findOne({_id:rec_id})
                        if(recommendation){
                            let managerInfo = await db.manager.findOne({_id: recommendation.manager}, {username: 1})
                            recommendation = recommendation._doc
                            if (managerInfo) {
                                Object.assign(recommendation, {
                                    managerUsername: managerInfo.username
                                })
                            }
                        }
                        favArr.push({
                            idea,recommendation
                        })
                    }
                    return res.send({
                        favArr
                    })
                }
            }
        }
        return res.send('-1')
    }

    static async publishIdea(req, res) {
        let {
            user_id,
            rec_id,
            content,
            blindMode,
            useRawAudio
        } = req.body
        if (rec_id && content && '' !== blindMode) {
            //check if have uploaded today
            let checkInfo = await db.idea.findOne({author:db.ObjectId(user_id),recommendation:db.ObjectId(rec_id)})
            let _id
            if(checkInfo){
                _id = checkInfo._id
            }else{
                _id = new db.ObjectId()
            }
            let fragments = []
            let Reg = new RegExp("/[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]/g")
            //author tts            
            let userPath = path.join('/static/sound/user', user_id.concat('.mp3'))
            let stat
            try {
                stat = fs.statSync(path.join(process.cwd(), userPath))
            } catch (e) {
                let query = await db.user.findOne({
                    _id: db.ObjectId(user_id)
                })
                if (query) {
                    let nickName = query.nickName
                    let text = '作者，'.concat(nickName.replace(Reg, ''))
                    fragments[0] = await myUtils.tencent_tts(text, userPath)
                } else {
                    //return default error
                    fragments[0] = '/static/sound/default/error_lost.mp3'
                }
            }
            if (stat) {
                fragments[0] = userPath
            }
            //date tts
            let date = myUtils.normalDate()
            let datePath = path.join('/static/sound/date', date + '.mp3')
            stat = undefined
            try {
                stat = fs.statSync(path.join(process.cwd(), datePath))
            } catch (e) {
                let text = '日期，'.concat(date.replace(/-/g, '.'))
                fragments[1] = await myUtils.tencent_tts(text, datePath)
            }
            if (stat) {
                fragments[1] = datePath
            }

            let contentToSound = async(contentText)=>{
                //content to sound
                let contentStr = contentText.replace(/\r|\n|\s/g, '')
                let len = contentStr.length
                let idx = 2
                while (len > myUtils.xf_tts_maxLength) {
                    let filePath = path.join('/static/sound/idea', _id.toString() + '_' + idx + '.mp3')
                    len -= myUtils.xf_tts_maxLength
                    let start = (idx - 2) * myUtils.xf_tts_maxLength
                    let end = start + myUtils.xf_tts_maxLength
                    let text = contentStr.substring(start, end)
                    if (idx === 2) {
                        text = '主要内容，'.concat(text)
                    }
                    fragments[idx] = await myUtils.xf_tts(text, filePath)
                    ++idx
                }
                let filePath = path.join('/static/sound/idea', _id.toString() + '_' + idx + '.mp3')
                let start = (idx - 2) * myUtils.xf_tts_maxLength
                let end = start + myUtils.xf_tts_maxLength
                let text = contentStr.substring(start, end)
                fragments[idx] = await myUtils.xf_tts(text, filePath)
            }

            //take a judgement
            if(blindMode === true){
                if(useRawAudio === true){
                    function writeSync(){
                        let savePath = path.join('/static/sound/idea',_id+'_2.mp3')
                        let writeStream = fs.createWriteStream(path.join(process.cwd(),savePath))
                        return new Promise((resolve,reject)=>{
                            writeStream.once('end',()=>{
                                resolve(savePath)
                            })
                        })
                    }
                    let savePath = await writeSync()
                    fragments[2] = savePath
                }else{
                    //voice recognization api
                    let mp3Path = path.join(process.cwd(),'/static/sound/temp',_id+'_2.mp3')
                    let newPath = path.join(process.cwd(),'/static/sound/temp',_id+'_2.wav')
                    fs.writeFileSync(mp3Path,content)
                    ffmpeg()
                        .addInput(path.join(process.cwd(),'test.mp3'))
                        .save(newPath)
                        .on("error", (err) => {
                            console.log(err)
                        })
                        .on("end", async() => {
                            // 转换成功 调用讯飞语音进行识别
                            let response = await myUtils.xf_recogn(newPath)
                            if(response.code == '0' && response.data){
                                //tts
                                contentToSound(response.data)
                                content = response.data
                            }else{
                                return res.send('-1')
                            }
                        })
                }
            }else{
                contentToSound(content)
                content = content.replace(/\r|\n/g,'  ')
            }

            //create idea
            let idea = await db.idea.findOneAndUpdate({_id:_id},{$set:{
                _id: _id,
                author: db.ObjectId(user_id),
                recommendation: db.ObjectId(rec_id),
                date: new Date(),
                content: content,
                soundFragments: fragments,
                random: Math.random()
            }},{new:true,upsert:true})
            if(blindMode === true){
                return res.send({
                    _id: idea._id,
                    content: content,
                    soundFragments: idea.soundFragments
                })
            }
            return res.send({_id: _id})
        }
        return res.send('-1')
    }

    static async previewIdeaSound(req,res){

    }
    static async getIdea(req,res){
        let {rec_id,user_id,date} = req.query
        if(user_id && date){
            let queryDate = myUtils.toQueryDate(date)
            let idea
            if(rec_id){
                idea = await db.idea.findOne({author:db.ObjectId(user_id),recommendation:db.ObjectId(rec_id),date: {'$gte': queryDate[0], '$lt': queryDate[1]}})    
            }else{
                idea = await db.idea.findOne({author:db.ObjectId(user_id),date: {'$gte': queryDate[0], '$lt': queryDate[1]}})
            }
            if(idea){
                let userInfo = await db.user.findOne({_id:db.ObjectId(user_id)})
                if(userInfo){
                    let data = idea._doc
                    let nickName = userInfo.nickName
                    let authorAvatar = userInfo.avatarUrl
                    Object.assign(data,{
                        authorNickName: nickName,
                        authorAvatar: authorAvatar
                    })
                    return res.send(data)
                }
            }
        }
        return res.send('-1')
    }

    static async getPoints(req,res){
        let {sign,rec_id,user_id,date} = req.query
        if(user_id){
            if(rec_id){
                //return idea points
                let idea = await db.idea.findOne({author:db.ObjectId(user_id),recommendation:db.ObjectId(rec_id)},{points:1})
                if(idea){
                    return res.send({
                        _id: idea._id.toString(),
                        points: idea.points
                    })
                }
            }else if(date){
                let queryDate = myUtils.toQueryDate(date)
                let idea = await db.idea.findOne({author:db.ObjectId(user_id),date: {'$gte': queryDate[0], '$lt': queryDate[1]}})
                if(idea){
                    return res.send({
                        _id: idea._id.toString(),
                        points: idea.points
                    })
                }
            }else{
                //return user points
                let user = await db.idea.findOne({_id:db.ObjectId(user_id)},{points:1})
                if(user){
                    return res.send({
                        _id: user._id.toString(),
                        points: user.points
                    })
                }
            }
        }
        return res.send('-1')
    }

    static async getManagerDetail(req, res) {
        let manager_id = req.query.manager_id
        if (manager_id) {
            let manager = await db.manager.findOne({
                _id: db.ObjectId(manager_id)
            }, {
                username: 1
            })
            if (manager) {
                return res.send({
                    managerUsername: manager.username
                })
            }
        }
        return res.send('-1')
    }
}