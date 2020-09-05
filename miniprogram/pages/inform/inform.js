// miniprogram/pages/inform/inform.js
var app = getApp()
const db = wx.cloud.database()

Page({

  data: {
    feed: [{
      'title': '店铺评价',
      'description': '你在 周千千锅巴土豆 享受了美食哦，快来评价吧~',
      'occurTime': '2020-1-1 12:00:00'
    },{
      'title': '店铺评价',
      'description': '你在 蜜雪冰城 享受了美食哦，快来评价吧~',
      'occurTime': '2020-1-1 12:00:00'
    }]
  },

  onLoad: function(options) {

  },

  onShow: function() {
    this.getAndUpdateNotice()
  },

  async getAndUpdateNotice() {
    var toUpdate = await this.getNotice() //第一个await
    var promises = []
    for (let index = 0; index < toUpdate.length; index++) {
      promises.push(this.updateNoticeOnce(toUpdate, index))
    }
    Promise.all(promises).then(res => { //第二个不await，异步更新
      console.log('Update result: ', res)
    })
    return
  },

  getNotice: function() {
    return new Promise((resolve => {
      wx.cloud.callFunction({
        name: 'notice',
        data: {
          mode: 2,
          receive_openid: app.globalData.openId,
          length: this.data.feed.length
        }
      }).then(res => {
        this.setData({
          feed: this.data.feed.concat(res.result.data)
        })
        console.log('My Notice: ', this.data.feed)
        resolve(res.result.data)
      })
    }))
  },

  updateNoticeOnce: function(toUpdate, i) {
    return new Promise((resolve) => {
      wx.cloud.callFunction({
        name: 'notice',
        data: {
          mode: 3,
          _id: toUpdate[i]._id
        }
      }).then(res => {
        resolve(res)
      })
    })
  },

  removeThis: function(e) {
    var index = e.currentTarget.dataset.idx
    wx.cloud.callFunction({
      name: 'notice',
      data: {
        mode: 1,
        _id: this.data.feed[index]._id
      }
    }).then(res => {
      console.log('remove result: ', res)
      let feed = this.data.feed
      feed.splice(index, 1)
      this.setData({
        feed: feed
      })
    })
  },

  refresh: function() {
    console.log("refresh")
    wx.showNavigationBarLoading()
    wx.showLoading({
      title: '刷新中',
    })
    console.log("loaddata")
    this.setData({
      feed: []
    })
    this.getAndUpdateNotice().then(res => {
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1000
      })
      wx.hideNavigationBarLoading()
      console.log('refresh done')
    })
  },

  lower: function() {
    console.log("lower")
    wx.showNavigationBarLoading();
    this.nextLoad()
  },

  nextLoad: function() {
    wx.showLoading({
      title: '加载中',
    })
    this.getAndUpdateNotice().then(res => {
      wx.showToast({
        title: '加载成功',
        icon: 'success',
        duration: 1000
      })
      wx.hideNavigationBarLoading()
      console.log('nextLoad done')
    })
  },
  bindItemTap: function() {
    wx.navigateTo({
      url:'../add/add'
    })
  }
})
