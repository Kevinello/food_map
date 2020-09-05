// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'kws-cloud'
})
const db = cloud.database()
exports.main = async (event, context) => {
  return await db.collection('Activity')
  .skip(event.skipLength)
  .limit(event.limit)
  .get()
}