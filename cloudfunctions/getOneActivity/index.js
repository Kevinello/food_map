// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'kws-cloud'
})

// 云函数入口函数
const db = cloud.database()
exports.main = async (event, context) => {
  return await db.collection('Activity')
  .where({
    _id: event._id
  })
  .get()
}