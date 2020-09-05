//index.js
var app = getApp()
Page({
  data: {
    feed: [],
    feed_length: 0,
    cardCur: 0,
    swiperList: [{
      id: 0,
      type: 'image',
      url: 'cloud://kws-cloud.6b77-kws-cloud-1301717459/swiperImage/swiper_1.jpg'
    }, {
      id: 1,
      type: 'image',
      url: 'cloud://kws-cloud.6b77-kws-cloud-1301717459/swiperImage/swiper_2.jpg',
    }, {
      id: 2,
      type: 'image',
      url: 'cloud://kws-cloud.6b77-kws-cloud-1301717459/swiperImage/swiper_3.jpg'
    }],
    hasUserinfo: false,
    hasIdentity: false,
  },
  
  // cardSwiper轮播图函数
  cardSwiper(e) {
    this.setData({
      cardCur: e.detail.current
    })
  },

  onLoad: function () {
    console.log('onLoad')
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
      hasUserinfo: app.globalData.hasUserinfo,
      hasIdentity: app.globalData.hasIdentity
    })
    this.recommendActivity().then(res => {
      this.getMyActivity(true)
    })
     // 刷新页面
  },
  upper: function () {
    wx.showNavigationBarLoading()
    console.log("refresh")
    this.refresh() //这里调用刷新
  },
  lower: function () {
    console.log("lower")
    wx.showNavigationBarLoading();
    this.nextLoad()
  },

  getMyActivity: function(refreshFlag){
    return new Promise((resolve) => {
      this.changeTurn().then(res => {
        console.log(res, '当前轮次： ', app.globalData.recommendedActivity)
        if(refreshFlag){
          this.setData({
            feed: app.globalData.recommendedActivity.splice(0, Math.min(10, app.globalData.recommendedActivity.length))
          })
        }else{
          this.setData({
            feed: this.data.feed.concat(app.globalData.recommendedActivity.splice(0, Math.min(10, app.globalData.recommendedActivity.length)))
          })
        }
        console.log('My activities: ', this.data.feed)
    
        if(app.globalData.recommendedActivity.length <= 30 && app.globalData.recommendedActivity2.length == 0){
          this.getRecommendedActivity().then(res => {
            app.globalData.recommendedActivity2 = res
            app.globalData.recommendedActivity2.reverse()
            this.recommendSort2().then(res => {
              console.log('下个轮次的活动已就绪: ', app.globalData.recommendedActivity2)
            })
            resolve() // 提前resolve()，异步预加载下个轮次的活动
          })
        }else{
          resolve()
        }
      })
    })
  },

  getRecommendedActivity: function(){
    const MAX_LIMIT = 50
    return new Promise((resolve => {
      wx.cloud.callFunction({
        name: 'getActivity',
        data: {
          skipLength: Math.max(app.globalData.activityCount - app.globalData.recommendTurn * MAX_LIMIT, 0),
          limit: MAX_LIMIT
        }
      }).then(res =>{
        app.globalData.recommendTurn = app.globalData.recommendTurn + 1
        if(app.globalData.activityCount - app.globalData.recommendTurn * MAX_LIMIT <= 0){
          app.globalData.recommendTurn = 1
        }
        resolve(res.result.data)
      })
    }))
  },

  getCount: function(){
    return new Promise((resolve =>{
      wx.cloud.callFunction({
        name: 'getCount',
        data:{
          collectionName: 'Activity'
        }
      }).then(res =>{
        resolve(res.result.total)
      })
    }))
  },

  changeTurn: function(){
    return new Promise((resolve => {
      if(app.globalData.recommendedActivity.length == 0){
        app.globalData.recommendedActivity = app.globalData.recommendedActivity2
        app.globalData.recommendedActivity2 = []
        resolve('轮次更替')
      }
      resolve('')
    }))
  },

  getMyOrganization(origin_length){
    return new Promise((resolve => {
      var promises = []
      for (var i=origin_length; i<app.globalData.belongTo.length; i++){
        promises.push(this.getOrganizationOnce(i))
      };
      Promise.all(promises).then((result) => {
        if(origin_length == 0){
          this.setData({
            organization: result
          })
        }else{
          this.setData({
            organization: this.data.organization.concat(result)
          })
        }
        console.log('My organizations: ', this.data.organization)
        resolve()
      }).catch((error) => {
        console.log(error)
        resolve()
      })
    }))
  },

  getOrganizationOnce: function(i){
    return new Promise((resolve => {
      wx.cloud.callFunction({
        name: 'getOneOrganization',
        data: {
          _id: app.globalData.belongTo[i]
        }
      }).then(res => {
        resolve(res.result.data[0].name)
      })
    }))
  },

  recommendSort1: function(){
    return new Promise((resolve => {
      this.getMyOrganization(0)
      .then(res =>{
        for (let index = 0; index < app.globalData.recommendedActivity.length; index++) {
          const element = app.globalData.recommendedActivity[index];
          var recommendValue = 50 - index * 1 + element.read * 2 + element.collect * 5 + element.memberTakeIn.length * 10
          for (let index = 0; index < this.data.organization.length; index++) {
            if(this.data.organization[index] == element.organization_name){
              recommendValue += 100
            }
          }
          app.globalData.recommendedActivity[index].recommendValue = recommendValue
        }
        app.globalData.recommendedActivity.sort((a, b) => b.recommendValue - a.recommendValue)
        resolve()
      })
    }))
  },

  recommendSort2: function(){
    return new Promise((resolve => {
      this.getMyOrganization(0)
      .then(res =>{
        for (let index = 0; index < app.globalData.recommendedActivity2.length; index++) {
          const element = app.globalData.recommendedActivity2[index];
          var recommendValue = 50 - index * 1 + element.read * 2 + element.collect * 5 + element.memberTakeIn.length * 10
          for (let index = 0; index < this.data.organization.length; index++) {
            if(this.data.organization[index] == element.organization_name){
              recommendValue += 100
            }
          }
          app.globalData.recommendedActivity2[index].recommendValue = recommendValue
        }
        app.globalData.recommendedActivity2.sort((a, b) => b.recommendValue - a.recommendValue)
        resolve()
      })
    }))
  },

  async recommendActivity(){
    app.globalData.activityCount = await this.getCount()
    console.log('ActivityCount: ', app.globalData.activityCount)
    app.globalData.recommendedActivity = await this.getRecommendedActivity()
    app.globalData.recommendedActivity.reverse()
    await this.recommendSort1()
    console.log('初始轮次已就绪', app.globalData.recommendedActivity)
    app.globalData.recommendDone = true //推荐完成标志变量
  },

  //首页刷新
  refresh: function(){
    wx.showLoading({
      title: '刷新中',
    })
    console.log("loaddata")
    this.getMyActivity(true).then(res => {
      wx.hideNavigationBarLoading()
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1000
      })
      console.log('refresh done')
    })
  },

  //继续加载
  nextLoad: function(){
    wx.showLoading({
      title: '加载中',
      duration: 300
    })
    this.getMyActivity(false).then(res => {
      wx.showToast({
        title: '加载成功',
        icon: 'success',
        duration: 300
      })
      wx.hideNavigationBarLoading()
      console.log('nextLoad done')
    })
  },

  jump_more: function(){
    wx.switchTab({
      url: '../more/more',
    }) // 跳转到more
    console.log("Back to page more.")
  },

  switchSearch:function(){
    wx.navigateTo({
      url: '../search/search',
    })
  },

  //事件处理函数（跳转）
  bindItemTap: function(e) {
    var index = e.currentTarget.dataset.idx
    console.log('index: ', index)
    var _id = this.data.feed[index]._id

    wx.navigateTo({
      url: '../answer/answer?_id=' + _id
    })
  },

  //收藏活动
  collectActivity: function(e){
    //云开发数据库更改记录
    var index = e.currentTarget.dataset.idx
    var feed = this.data.feed
    if (app.globalData.collection.indexOf(feed[index]._id) == -1){
      feed[index].collect += 1
      app.globalData.collection.push(feed[index]._id)
      this.setData({
        feed: feed,
      })
      console.log(this.data.feed[index].collect)
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
          _id: feed[index]._id,
          collect: feed[index].collect,
          read: feed[index].read,
          memberTakeIn: feed[index].memberTakeIn,
        },
        complete: res => {
          console.log('Update activity success')
        }
      })
    }else{
      console.log("You have collected this activity")
    }
  },

  participateInActivity: function(e){
    var index = e.currentTarget.dataset.idx
    var feed = this.data.feed
    if (app.globalData.participateIn.indexOf(feed[index]._id) == -1){
      feed[index].memberTakeIn.push(app.globalData.openId)
      app.globalData.participateIn.push(feed[index]._id)
      this.setData({
        feed: feed
      })
      console.log(this.data.feed[index].memberTakeIn)
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
          _id: feed[index]._id,
          collect: feed[index].collect,
          read: feed[index].read,
          memberTakeIn: feed[index].memberTakeIn,
        },
        complete: res => {
          console.log('Update activity success')
        }
      })
    }else{
      console.log("You have participated in this activity")
    }
  },

  //创建新的活动
  addTopic: function addTopic() {
     wx.navigateTo({
     url: "../addTopic/addTopic"
     })
  }

})


