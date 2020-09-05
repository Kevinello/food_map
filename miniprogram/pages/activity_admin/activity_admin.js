// miniprogram/pages/activity_admin/activity_admin.js
var app = getApp()
Page({
  data: {
    feed: [],
  },
  onLoad: function(){
    
  },

  onShow: function(){
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
      createactivity:app.globalData.createactivity
    })
    console.log(app.globalData)
    console.log(this.data.createactivity)
    this.getMyCreateActivity(0)
  },

  jump_more: function(){
    wx.switchTab({
      url: '../more/more',
    }) // 跳转到more
    console.log("Back to page more.")
  },

  upper: function () {
    wx.showNavigationBarLoading()
    this.refresh() //这里调用刷新
  },

  refresh: function(){
    console.log('refresh')
    wx.showLoading({
      title: '刷新中',
    })
    console.log("loaddata")
    this.getMyCreateActivity(0).then(res => {
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1000
      })
      console.log('resfresh done')
    })
  },

  lower: function () {
    console.log("lower")
    wx.showNavigationBarLoading()
    this.nextLoad()
  },

  nextLoad: function(){
    wx.showLoading({
      title: '加载中',
    })
    this.getMyCreateActivity(this.data.feed.length).then(res => {
      wx.showToast({
        title: '加载成功',
        icon: 'success',
        duration: 1000
      })
      wx.hideNavigationBarLoading()
      console.log('nextLoad done')
    })
  },

  async getMyCreateActivity(origin_length){
    var promises = []
    for (var i=origin_length; i<Math.min(this.data.createactivity.length, origin_length+5); i++){
      promises.push(this.getActivityOnce(i))
    };
    await Promise.all(promises).then((result) => { // await Promise.all再return
      if(origin_length == 0){
        this.setData({
          feed: result
        })
      }else{
        this.setData({
          feed: this.data.feed.concat(result)
        })
      }
      console.log('My activities: ', this.data.feed)
    }).catch((error) => {
      console.log(error)
    })
    return
  },

  getActivityOnce: function(i){
    return new Promise((resolve => {
      wx.cloud.callFunction({
        name: 'getOneActivity',
        data: {
          _id: this.data.createactivity[i]
        }
      }).then(res => {
        resolve(res.result.data[0])
      })
    }))
  },

  bindItemTap: function(e) {
    var index = e.currentTarget.dataset.idx
    console.log('index: ', index)
    var _id = this.data.feed[index]._id

    wx.navigateTo({
      url: '../ac_change/ac_change?_id=' + _id
    })
  },
})
