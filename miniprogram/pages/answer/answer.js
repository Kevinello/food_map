//answer.js
var util = require('../../utils/util.js')
var app = getApp()
Page({
  data: {
    motto: '',
    userInfo: {},
  },
  //事件处理函数
  toQuestion: function() {
    wx.navigateTo({
      url: '../question/question'
    })
  },
  onLoad: function (options) {
    console.log('onLoad')
    this.setData({
      _id: options._id,
      school: app.globalData.school,
      studentid: app.globalData.studentid,
    })
  },
  onShow: function(){
    console.log('onShow')
    this.getOneActivity()
  },
  tapName: function(event){
    console.log(event)
  },
  getOneActivity: function(){
    wx.cloud.callFunction({
      name: 'getOneActivity',
      data: {
        _id: this.data._id
      },
      complete: res => {
        console.log('Get result: ', res.result.data[0])
        //console.log(res.result.data[0].membercollect.indexOf(this.data._id)==-1)
        //console.log(res.result.data[0].memberTakeIn.indexOf(this.data._id)==-1)
        let activity = res.result.data[0]
        if(app.globalData.hasRead.indexOf(this.data._id) == -1){
          activity.read++
          app.globalData.hasRead.push(this.data._id)
        }
        this.setData({
          Activity: activity,
          iscollected:res.result.data[0].membercollect.indexOf(app.globalData.openId)==-1,
          istakein:res.result.data[0].memberTakeIn.indexOf(app.globalData.openId)==-1
        })
        this.read()
      }
    })
  },
  collectActivity: function(){
    //云开发数据库更改记录
    var Activity = this.data.Activity
    if (app.globalData.collection.indexOf(this.data._id) == -1){
      Activity.collect += 1
      app.globalData.collection.push(this.data._id)
      Activity.membercollect.push(app.globalData.openId)
    }else{
      Activity.collect -= 1
      util.removeByValue(app.globalData.collection,this.data._id)
      util.removeByValue(Activity.membercollect,app.globalData.openId)
    }
      this.setData({
        Activity: Activity
      })
      // console.log(this.data.Activity.collect)
      console.log(app.globalData.collection)
      wx.cloud.callFunction({ //更新用户信息（统一的函数）
        name: 'updateAlluserdata',
        data: {
          userInfo: app.globalData.userInfo,
          belongTo: app.globalData.belongTo,
          collection: app.globalData.collection,
          participateIn: app.globalData.participateIn,
          school: app.globalData.school,
          studentid: app.globalData.studentid,
          hasUserinfo: app.globalData.hasUserinfo,
          hasIdentity: app.globalData.hasIdentity,
          openId: app.globalData.openId,
        },
        complete: res => {
          console.log('Update user success')
        }
      })
      wx.cloud.callFunction({
        name: 'updateAllActivityData',
        data: {
          _id: this.data._id,
          collect: this.data.Activity.collect,
          read: this.data.Activity.read,
          memberTakeIn: this.data.Activity.memberTakeIn,
          membercollect:this.data.Activity.membercollect
        },
        complete: res => {
          console.log('Update activity success')
        }
      })
      this.setData({
        iscollected:this.data.Activity.membercollect.indexOf(app.globalData.openId)==-1
      })
  },
  participateInActivity: function(){
    var Activity = this.data.Activity
    if (app.globalData.participateIn.indexOf(this.data._id) == -1){
      Activity.memberTakeIn.push(app.globalData.openId)
      app.globalData.participateIn.push(this.data._id)   
    }else{
      util.removeByValue(Activity.memberTakeIn,app.globalData.openId),
      util.removeByValue(app.globalData.participateIn,this.data._id)
    }
      this.setData({
        Activity: Activity
      })
      console.log(this.data.Activity.memberTakeIn)
      console.log(app.globalData.participateIn)
      wx.cloud.callFunction({ //更新用户信息（统一的函数）
        name: 'updateAlluserdata',
        data: {
          userInfo: app.globalData.userInfo,
          belongTo: app.globalData.belongTo,
          collection: app.globalData.collection,
          participateIn: app.globalData.participateIn,
          school: app.globalData.school,
          studentid: app.globalData.studentid,
          hasUserinfo: app.globalData.hasUserinfo,
          hasIdentity: app.globalData.hasIdentity,
          openId: app.globalData.openId,
        },
        complete: res => {
          console.log('Update user success')
        }
      })
      wx.cloud.callFunction({
        name: 'updateAllActivityData',
        data: {
          _id: this.data._id,
          collect: this.data.Activity.collect,
          read: this.data.Activity.read,
          memberTakeIn: this.data.Activity.memberTakeIn,
        },
        complete: res => {
          console.log('Update activity success')
        }
      })
      this.setData({
        istakein:this.data.Activity.memberTakeIn.indexOf(app.globalData.openId)==-1
      })
  },

  read: function(){
    wx.cloud.callFunction({
      name: 'updateAllActivityData',
      data: {
        _id: this.data._id,
        collect: this.data.Activity.collect,
        read: this.data.Activity.read,
        memberTakeIn: this.data.Activity.memberTakeIn,
        membercollect:this.data.Activity.membercollect
      },
      complete: res => {
        console.log('Update activity success: ', res)
      }
    })
  }
})
