// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'kws-cloud'
})
const db = cloud.database()
const _ = db.command
exports.main = async (event, context) => { //event就是外面的data
  try {
    console.log(event)
    return await db.collection('organization').where({
      _id: event._id //根据_id找到该活动
    })
    .update({
      data: { //更新活动所有可变信息
        activity: event.activity,
        joinRequest: event.joinRequest,
        member: event.member,
      }
    })
  } catch(e) {
    console.error(e)
  }
  return event
}