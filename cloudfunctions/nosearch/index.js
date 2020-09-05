// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'kws-cloud'
})
const db = cloud.database()
const _ = db.command
exports.main = async (event, context) => { //event就是外面的data
  switch(event.resType){
    case 0:
      return await db.collection('organization')
      .skip(event.skipLength)
      .where({
         type: event.navType
      })
      .limit(10)
      .get()
    case 1:
      return await db.collection('Activity')
      .skip(event.skipLength)
      .where({
        organization_type:event.navType
      })
      .limit(10)
      .get()
  }
}