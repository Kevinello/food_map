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
      .skip(Math.max(0, event.skipLength))
      .limit(Math.min(20, event.skipLength + 20))
      .get()
    case 1:
      return await db.collection('Activity')
      .skip(Math.max(0, event.skipLength))
      .limit(Math.min(20, event.skipLength + 20))
      .get()
  }
}