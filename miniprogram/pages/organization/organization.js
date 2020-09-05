//logs.js
var app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    feed: []
  },
  onLoad: function () {
    
  },
  onShow() {
    console.log('onShow')
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
    this.getMyOrganization(0)
    // 刷新页面
  },
  
  async getMyOrganization(origin_length){
    var promises = []
    for (var i=origin_length; i<app.globalData.belongTo.length; i++){
      promises.push(this.getOrganizationOnce(i))
    };
    await Promise.all(promises).then((result) => {
      if(origin_length == 0){
        this.setData({
          feed: result
        })
      }else{
        this.setData({
          feed: this.data.feed.concat(result)
        })
      }
      console.log('My organizations: ', this.data.feed)
    }).catch((error) => {
      console.log(error)
    })
    return
  },

  getOrganizationOnce: function(i){
    return new Promise((resolve => {
      wx.cloud.callFunction({
        name: 'getOneOrganization',
        data: {
          _id: app.globalData.belongTo[i]
        }
      }).then(res => {
        let organization = res.result.data[0]
        if (organization._openid == app.globalData.openId){
          organization.isCreator = true
        }else{
          organization.isCreator = false
        }
        resolve(organization)
      })
    }))
  },

  bindItemTap1: function() {
    wx.switchTab({
      url: '../search/search'
    })
  },

  bindItemTap2: function() {
    wx.navigateTo({
      url: '../addOrganization/addOrganization'
    })
  },

  jump_room:function(){
    wx.navigateTo({
      url: '../room/room',
    })
  },

  toManage: function(e){
    var index = e.currentTarget.dataset.idx
    //console.log(index, this.data.feed[index].joinRequest)
    wx.setStorageSync('organization', this.data.feed[index])
    wx.navigateTo({
      url: '../manage/manage',
    })
  },

  refresh: function(){
    console.log("refresh")
    wx.showNavigationBarLoading()
    wx.showLoading({
      title: '刷新中',
    })
    this.setData({
      feed: []
    })
    console.log("loaddata")
    this.getMyOrganization(0).then(res => {
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1000
      })
      wx.hideNavigationBarLoading()
      console.log('refresh done')
    })
  },
})
