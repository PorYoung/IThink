import express from 'express'
//API请求路由
import apiRouter from './api'

const router = express.Router()

router
  .use('/api', apiRouter)

export default router