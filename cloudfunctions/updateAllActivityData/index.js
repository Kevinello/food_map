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
    return await db.collection('Activity').where({
      _id: event._id //根据_id找到该活动
    })
    .update({
      data: { //更新活动所有可变信息
        collect: event.collect,
        read: event.read,
        memberTakeIn: event.memberTakeIn,
        membercollect:event.membercollect
      }
    })
  } catch(e) {
    console.error(e)
  }
  return event
}