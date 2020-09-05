//activity.js
var app = getApp()
var datetime = new Date()
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
      timestamp: datetime.getTime()
    })
    this.getMyActivity(0)
  },

  jump_more: function(){
    wx.switchTab({
      url: '../more/more',
    }) // 跳转到more
    console.log("Back to page more.")
  },

  upper: function () {
    wx.showNavigationBarLoading()
    console.log("refresh")
    this.refresh() //这里调用刷新
  },

  refresh: function(){
    wx.showLoading({
      title: '刷新中',
    })
    console.log("loaddata")
    this.getMyActivity(0).then(res => {
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1000
      })
      wx.hideNavigationBarLoading()
      console.log('refresh done')
    })
  },

  lower: function () {
    wx.showNavigationBarLoading();
    this.nextLoad();
    console.log("lower")
  },

  nextLoad: function(){
    wx.showLoading({
      title: '加载中',
      duration: 400
    })
    this.getMyActivity(this.data.feed.length).then(res => {
      wx.showToast({
        title: '加载成功',
        icon: 'success',
        duration: 400
      })
      wx.hideNavigationBarLoading()
      console.log('nextLoad done')
    })
  },

  getMyActivity: function(origin_length){
    return new Promise((resolve) => {
      var promises = []
      for (var i=origin_length; i<Math.min(this.data.participateIn.length, origin_length+5); i++){
        promises.push(this.getActivityOnce(i))
      };
      Promise.all(promises).then((result) => {
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
        resolve()
      }).catch((error) => {
        console.log(error)
        resolve()
      })
    })
  },

  getActivityOnce: function(i){
    return new Promise((resolve => {
      wx.cloud.callFunction({
        name: 'getOneActivity',
        data: {
          _id: this.data.participateIn[i]
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
      url: '../answer/answer?_id=' + _id
    })
  },
})
