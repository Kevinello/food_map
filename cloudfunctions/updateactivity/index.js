// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'kws-cloud'
})
const db = cloud.database()
const _ = db.command
exports.main = async (event, context) => { //event就是外面的data
    switch(event.mode){
      case 0:{
        return await db.collection('Activity')
        .where({
          _id: event._id //根据_id找到该活动
        })
        .update({
          data: { //更新活动所有可变信息
            description:event.description,
            holdPlace:event.holdPlace,
            name:event.name,
            startTime:event.startTime,
            organization_id: event.organization_id,
            organization_type: event.organization_type,
            organization_name: event.organization_name
          }
        })
      }
      case 1:{
        return await db.collection('Activity')
        .where({
          _id: event._id //根据_id找到该活动
        })
        .update({
          data: { //更新活动所有可变信息
            description:event.description,
            holdPlace:event.holdPlace,
            name:event.name,
            startTime:event.startTime
          }
        })
      }
    }
    console.log(event)



  return event
}