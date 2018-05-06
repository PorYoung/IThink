import express from 'express'
import User from './user'
const apiRouter = express.Router()

apiRouter
    .use(User)

export default apiRouter