import express from 'express'
import User from './user'
import App from './app'
const apiRouter = express.Router()

apiRouter
    .use(User)
    .use(App)

export default apiRouter