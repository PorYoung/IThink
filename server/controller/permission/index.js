import md5 from 'md5'
export default class{
    static async managerSessionCheck(req,res,next){
        if(req.session.userid){
            next()
        }else{
            return res.redirect('/login')
        }
    }
    static async permissionCheck(req,res,next){
        let sign = req.query.sign
        let user_id = req.query.user_id
        let flag = true
        if(sign && user_id){
            let info = await db.user.findOne({_id:db.ObjectId(user_id)},{openid:1})
            if(info){
                let signStr = md5(user_id.concat(md5(info.openid)))
                if(sign === signStr){
                    next()
                }else{
                    flag = false
                }
            }else{
                flag = false
            }
        }else{
            flag = false
        }
        if(flag === false){
            return res.send('Permission Denied')
        }
    }
}