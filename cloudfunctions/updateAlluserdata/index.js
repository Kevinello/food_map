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
    return await db.collection('user').where({
      _openid: event.openId //根据openid找到该用户的记录
    })
    .update({
      data: { //更新user的所有信息
        userInfo: event.userInfo,
        belongTo: event.belongTo,
        collection: event.collection,
        participateIn: event.participateIn,
        school: event.school,
        studentid: event.studentid,
        hasUserinfo: event.hasUserinfo,
        hasIdentity: event.hasIdentity,
        createactivity:event.createactivity
      }
    })
  } catch(e) {
    console.error(e)
  }
  return event
}