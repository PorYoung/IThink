import express from 'express'
import App from '../../../controller/app'
import Permission from '../../../controller/permission'

const appRouter = express.Router()

appRouter
    .get('/todayRecommendation', Permission.permissionCheck, App.getTodayRecommendation)
    .get('/getRecommendation',Permission.permissionCheck,App.getRecommendation)
    .get('/getHistory',Permission.permissionCheck,App.getHistory)
    .get('/randomIdea',Permission.permissionCheck,App.randomIdea)
    .get('/ideaInLikes',Permission.permissionCheck,App.ideaInLikes)
    .get('/getFavorite',Permission.permissionCheck,App.getFavorite)
    .get('/getIdea',Permission.permissionCheck,App.getIdea)
    .get('/getPoints',Permission.permissionCheck,App.getPoints)
    .get('/getManagerDetail', Permission.permissionCheck, App.getManagerDetail)
    .post('/publishIdea', App.publishIdea)

export default appRouter