export default class {
    static async getTodayRecommendation(req, res) {
        let user_id = req.query.user_id
        if (user_id) {
            user_id = db.ObjectId(user_id)
        } else {
            return res.send('-1')
        }
        let date = new Date()
        let today = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
        let recoms = await db.recommendation.findOne({date: today,users: user_id})
        if (recoms) {
            let managerInfo = await db.manager.findOne({_id: recoms.manager}, {username: 1})
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
        if (recoms) {
            let len = recoms.length
            let idx = 0
            if (len > 1) {
                idx = Math.floor(Math.random() * len)
                if (idx >= len) {
                    idx = len - 1
                }
            }
            let tdRec = recoms[idx]
            tdRec = await db.recommendation.findOneAndUpdate({_id: tdRec._id}, {$push: {users: user_id}}, {new: true})
            if (tdRec) {
                let managerInfo = await db.manager.findOne({_id: tdRec.manager}, {username: 1})
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