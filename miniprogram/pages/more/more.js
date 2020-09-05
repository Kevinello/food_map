//logs.js
var app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    newmsg:0,
  },
  onLoad: function () {
    this.getopenId()
    console.log('this.data: ', this.data)
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserinfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserinfo: true
        })
        app.globalData.userInfo = res.userInfo
        app.globalData.hasUserinfo = true
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理 (18年的改动了..应该不会有了吧)
      wx.getUserInfo({
        success: res => {
          console.log("old version")
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo
          })
          app.globalData.hasUserinfo = true
        }
      })
    }
  },
  onShow() {
    this.getmsgNum()
    var app1 = getApp()
    this.setData({
      userInfo: app1.globalData.userInfo,
      belongTo: app1.globalData.belongTo,
      collection: app1.globalData.collection,
      participateIn: app1.globalData.participateIn,
      school: app1.globalData.school,
      studentid: app1.globalData.studentid,
      hasUserinfo: app1.globalData.hasUserinfo,
      hasIdentity: app1.globalData.hasIdentity,
      openId: app1.globalData.openId,
      createactivity:app1.globalData.createactivity
    })
    // 刷新页面
  },
  getopenId:function(){
    var that = this
    wx.cloud.callFunction({
      name: 'login',
      complete: res => {
        console.log('callFunction login result: ', res.result.openId)
        app.globalData.openId = res.result.openId
        db.collection('user').where({
          _openid: app.globalData.openId // 当前用户 openId
        }).get({
          success: function(res) {
            console.log('Get user result:', res.data[0])
            if (res.data.length == 0){ // 如果数据库中没有该用户，则添加该用户
              console.log('user not exist, register now.')
              db.collection('user').add({ 
                data: { //将globalData中的初始化数据传上去（openid会自动加上去）
                  userInfo: app.globalData.userInfo,
                  belongTo: app.globalData.belongTo,
                  collection: app.globalData.collection,
                  participateIn: app.globalData.participateIn,
                  school: app.globalData.school,
                  studentid: app.globalData.studentid,
                  hasUserinfo: app.globalData.hasUserinfo,
                  hasIdentity: app.globalData.hasIdentity,
                  createactivity:app.globalData.createactivity
                },
                success: function(res) {
                  console.log('add result: ', res)
                },
                fail: console.error,
              })
            }
            // 如果数据库里有该用户的话，拉取信息到本地
            else{
              console.log('User exist')
              that.setData({ //拉取信息到本页面
                userInfo: res.data[0].userInfo,
                belongTo: res.data[0].belongTo,
                collection: res.data[0].collection,
                participateIn: res.data[0].participateIn,
                school: res.data[0].school,
                studentid: res.data[0].studentid,
                hasUserinfo: res.data[0].hasUserinfo,
                hasIdentity: res.data[0].hasIdentity,
                createactivity:res.data[0].createactivity
              })
              // 拉取信息到globalData方便其它页面使用
              app.globalData.userInfo = res.data[0].userInfo
              app.globalData.belongTo = res.data[0].belongTo
              app.globalData.collection = res.data[0].collection
              app.globalData.participateIn = res.data[0].participateIn
              app.globalData.school = res.data[0].school
              app.globalData.studentid = res.data[0].studentid
              app.globalData.hasUserinfo = res.data[0].hasUserinfo
              app.globalData.hasIdentity = res.data[0].hasIdentity
              app.globalData.createactivity=res.data[0].createactivity
            }
            console.log(app.globalData)
            that.getmsgNum()
          },
          fail: console.error
        })
      }
    })
  },
  bindGetUserInfo (e) {
    this.setData({
      userInfo: e.detail.userInfo
    })
    app.globalData.userInfo = e.detail.userInfo
    app.globalData.hasUserinfo = true
    console.log(app.globalData)
    wx.cloud.callFunction({ //这里开始调用云函数
      name: 'updateAlluserdata',
      data: { // data是传进云函数的参数，内容是user的所有信息（因为打算其他地方也统一用这个函数所以所有信息都放进去了）
        userInfo: app.globalData.userInfo,
        belongTo: app.globalData.belongTo,
        collection: app.globalData.collection,
        participateIn: app.globalData.participateIn,
        school: app.globalData.school,
        studentid: app.globalData.studentid,
        hasUserinfo: app.globalData.hasUserinfo,
        hasIdentity: app.globalData.hasIdentity,
        openId: app.globalData.openId,
        createactivity:app.globalData.createactivity
      },
      complete: res => {
        console.log('Update success')
      }
    })
  },
  //获得未读消息数
  getmsgNum:function(){
      wx.cloud.callFunction({
        name: 'notice',
        data:{
          mode: 4,
          receive_openid: app.globalData.openId,
        }
      }).then(res => {
        this.setData({
          newmsg: res.result.data.length
        })
        // console.log('My Notice: ', res, app.globalData.openId)
        // resolve(res.result.data)
      })
  }
})
