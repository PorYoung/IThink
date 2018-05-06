import express from 'express'

import Manager from '../../controller/manager'

const router = express.Router()

router
    .get('/', Manager.page_index)

export default router