import config from '../../../config'
import request from 'superagent'
import md5 from 'md5'
import path from 'path'
import myUtils from '../../common/utils'
export default class {
    static async onLogin(req, res) {
        let code = req.body.code
        let userInfo = req.body.userInfo
        if (code && userInfo) {
            //authenticate against wechat server
            let url = `${config.wechat_login_url}?appid=${config.wechat_AppID}&secret=${config.wechat_AppSecret}&js_code=${code}&grant_type=authorization_code`
            let response = await request.get(url)
            let info = response.text
            try{
                info = JSON.parse(info)
            }catch(e){
                return res.send({
                    errMsg: 'cannot get openid'
                })
            }
            if (info.openid) {
                //query user infomation from databases
                let queryData = await db.user.findOne({openid:info.openid})
                let isFirst = false
                if(!userInfo.nickName){
                    userInfo.nickName = '游客'.concat(md5(info.openid))
                }
                if(!userInfo.avatarUrl){
                    userInfo.avatarUrl = config.server_url.concat('/static/image/default_avatar.jpg')
                }
                if(!queryData){
                    //user does not exist and create a user record
                    let Reg = new RegExp("/[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]/g")
                    let text = '作者，' + userInfo.nickName.replace(Reg,'')
                    await myUtils.tencent_tts(text,path.join('/static/sound/user',info.openid + '.mp3'))
                    queryData = await db.user.create({openid:info.openid,nickName:userInfo.nickName,avatarUrl:userInfo.avatarUrl})
                    //return first use flag to start using instruction in small program
                    isFirst = true
                }else if(queryData.nickName!=userInfo.nickName||queryData.avatarUrl!=userInfo.avatarUrl){
                    queryData = await db.user.updateOne({openid:info.openid},{nickName:userInfo.nickName,avatarUrl:userInfo.avatarUrl},{new:true})
                }
                req.session._id = queryData._id
                return res.send({
                    errMsg: '1',
                    isFirst: isFirst,
                    blindMode: queryData.blindMode,
                    _id: queryData._id.toString(),
                    nickName: queryData.nickName,
                    avatarUrl: queryData.avatarUrl,
                    points: queryData.points,
                    signStr: md5(info.openid)
                })
            } else {
                return res.send({
                    errMsg: 'cannot get openid'
                })
            }
        } else {
            return res.send({
                errMsg: 'no code'
            })
        }
    }
}