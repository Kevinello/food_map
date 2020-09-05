//logs.js
var util = require('../../utils/util.js')
var app = getApp()
Page({
  data: {
    keyword: "",
    length: 0,
  },
  onLoad: function () {
    this.setData({
      userInfo: app.globalData.userInfo,
      belongTo: app.globalData.belongTo,
      collection: app.globalData.collection,
      participateIn: app.globalData.participateIn,
      school: app.globalData.school,
      studentid: app.globalData.studentid,
      hasUserinfo: app.globalData.hasUserinfo,
      hasIdentity: app.globalData.hasIdentity,
    })
    console.log(this.data)
  },
  getInputId: function (e){
    this.setData({ 
      studentid: e.detail.value
    })
  },
  getInputSchool: function (e){
    this.setData({ 
      school: e.detail.value
    })
  },
  jump: function(){
    wx.navigateTo({
      url: '',
    })
  },
  // 保存信息
  saveIdentity: function(){
    if(this.data.school == "暂未进行身份认证" || this.data.studentid == "暂未进行身份认证"){
      wx.showModal({
        title: '提示',
        content: '请完整输入学校与学号',
        showCancel: false,
        success (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }else{
      app.globalData.school = this.data.school
      app.globalData.studentid = this.data.studentid
      app.globalData.hasIdentity = true
      wx.navigateBack({
        complete: (res) => {
          wx.showToast({
            title: '修改成功',
            icon: 'success',
            duration: 1000
          })
        },
      })
    }
    console.log(app.globalData.school)
    console.log(app.globalData.studentid)
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
      },
      complete: res => {
        console.log('Update success')
      }
    })
  }
})
