//collection.js
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
    })
    this.getMyActivity(0)
  },

  upper: function () {
    console.log("refresh")
    wx.showNavigationBarLoading()
    this.refresh(); //这里调用刷新
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
    console.log("lower")
    wx.showNavigationBarLoading()
    this.nextLoad()
  },

  nextLoad: function(){
    wx.showLoading({
      title: '加载中',
    })
    this.getMyActivity(this.data.feed.length).then(res => {
      wx.showToast({
        title: '加载成功',
        icon: 'success',
        duration: 1000
      })
      wx.hideNavigationBarLoading()
      console.log('nextLoad done')
    })
  },

  async getMyActivity(origin_length){
    var promises = []
    for (var i=origin_length; i<Math.min(this.data.collection.length, origin_length+5); i++){
      promises.push(this.getActivityOnce(i))
    };
    await Promise.all(promises).then(result => {
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
          _id: this.data.collection[i]
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
