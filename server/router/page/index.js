import express from 'express'

import Manager from '../../controller/manager'

import Permission from '../../controller/permission'

const router = express.Router()

router
    .get('/', Manager.page_index)
    .get('/login', Manager.page_login)
    .get('/management', Manager.page_management)
    .post('/login', Manager.fun_login)
    .post('/management/uploadRecommendation', Permission.managerSessionCheck, Manager.fun_uploadRecommendation)

export default router