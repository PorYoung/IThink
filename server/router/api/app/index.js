import express from 'express'
import App from '../../../controller/app'
import Permission from '../../../controller/permission'

const appRouter = express.Router()

appRouter
    .get('/todayRecommendation',Permission.permissionCheck,App.getTodayRecommendation)
    .get('/todayRecommendation',Permission.permissionCheck,App.getManagerDetail)

export default appRouter