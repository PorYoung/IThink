//连接数据库
import dbConnetion from './connection' 

import Modules from './modules'

const db = {
    user:Modules.user,
    idea:Modules.idea,
    comment:Modules.comment,
    recommendation:Modules.recommendation,
    star:Modules.star
}

export default db