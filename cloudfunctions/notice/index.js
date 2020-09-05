// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'kws-cloud'
})

// 云函数入口函数
const db = cloud.database()
exports.main = async (event, context) => {
  switch(event.mode){
    case 0:{
      return await db.collection('notice')
      .add({
        data: {
          title: event.title,
          description: event.description,
          hasRead: event.hasRead,
          occurTime: event.occurTime,
          receive_openid: event.receive_openid,
        }
      })
    }
    case 1:{
      return await db.collection('notice')
      .where({
        _id: event._id
      })
      .remove()
    }
    case 2:{
      return await db.collection('notice')
      .where({
        receive_openid: event.receive_openid
      })
      .orderBy('hasRead', 'desc')
      .orderBy('occurTime', 'asc')
      .skip(event.length)
      .limit(10)
      .get()
    }
    case 3:{
      return await db.collection('notice')
      .where({
        _id: event._id
      })
      .update({
        data:{
          hasRead: true
        }
      })
    }
    case 4:{
      return await db.collection('notice')
      .where({
        receive_openid: event.receive_openid,
        hasRead: false
      })
      .get()
    }
  }
}