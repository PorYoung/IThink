import mongoose from '../config'

const options = {
  //user: 'admin',
  //pwd: '123456',
  host: 'localhost',
  port: '27017',
  database: 'ithink'
  //authSource: 'admin',
}

// const uri = `mongodb://${options.user}:${options.pwd}@${options.host}:${options.port}/${options.database}?authSource=${options.authSource}`
const uri = `mongodb://${options.host}:${options.port}/${options.database}`

const dbConnection = mongoose.connect(uri, {
  useMongoClient: true
})

dbConnection.on('error', console.error.bind(console, 'connection error:'))
dbConnection.once('open', function () {
    console.log('数据库链接成功')
})

export default dbConnection