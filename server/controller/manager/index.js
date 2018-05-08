 import path from 'path'
 import md5 from 'md5'
 export default class{
    static async page_index(req,res){
        return res.send('hello world!')
    }

    static async page_login(req,res){
        if(req.session.username){
            return res.redirect('/management')
        }
        return res.sendFile(path.join(process.cwd(),'/server/views/login.html'))
    }

    static async page_management(req,res){
        if(req.session.username){
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
            req.session.username = username
            return res.send('1')
        }else{
            return res.send('-2')
        }
    }
}