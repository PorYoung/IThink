import express from 'express'
import User from '../../../controller/user'

const userRouter = express.Router()

userRouter
    .get('/onLogin',User.onLogin)

export default userRouter