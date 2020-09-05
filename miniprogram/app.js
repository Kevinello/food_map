//app.js
App({
  globalData:{
    userInfo: {},
    belongTo: [],
    collection: [],
    participateIn: [],
    school: "暂未进行身份认证",
    studentid: "暂未进行身份认证",
    hasUserinfo: false,
    hasIdentity: false,
    hasRead: [],
    openId: "",
    recommendTurn: 1,
    recommendedActivity: [],
    recommendedActivity2: [],
    recommendDone: false,
    createactivity:[]
  },

  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    wx.cloud.init({
      env: 'kws-cloud',
      traceUser: true,
    })
    this.getUserInfo()
  },

  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口（需要权限）
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              console.log(res)
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
})