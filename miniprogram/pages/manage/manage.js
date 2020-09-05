//manage.js
var app = getApp()
Page({
  data: {
    feed: [],
  },
  onLoad: function(){
    this.setData({
      organization: wx.getStorageSync('organization')
    })
    console.log(this.data.organization)
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
    this.getMyRequests(0)
  },

  upper: function () {
    console.log("refresh")
    wx.showNavigationBarLoading()
    this.refresh() //这里调用刷新
  },

  refresh: function(){
    wx.showLoading({
      title: '刷新中',
    })
    console.log("loaddata")
    this.getOrganizationOnce().then(res => {
      this.setData({
        organization: res
      })
      this.getMyRequests(0).then(res => {
        wx.showToast({
          title: '刷新成功',
          icon: 'success',
          duration: 1000
        })
        wx.hideNavigationBarLoading()
        console.log('refresh done')
      })
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
    this.getMyRequests(this.data.feed.length).then(res => {
      wx.showToast({
        title: '加载成功',
        icon: 'success',
        duration: 1000
      })
      wx.hideNavigationBarLoading()
      console.log('nextLoad done')
    })
  },

  async getMyRequests(origin_length){
    var promises = []
    for (var i=origin_length; i<Math.min(this.data.organization.joinRequest.length, origin_length+10); i++){
      promises.push(this.getRequestOnce(i))
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
      console.log('Requests: ', this.data.feed)
    }).catch((error) => {
      console.log(error)
    })
    return
  },

  getRequestOnce: function(i){
    return new Promise((resolve => {
      wx.cloud.callFunction({
        name: 'getOneUser',
        data: {
          _openid: this.data.organization.joinRequest[i]
        }
      }).then(res => {
        resolve(res.result.data[0])
      })
    }))
  },

  async accept(e) {
    var index = e.currentTarget.dataset.idx
    var organization = this.data.organization
    var feed = this.data.feed
    var user = feed[index]
    user.belongTo.push(organization._id)
    organization.member.push(organization.joinRequest[index])
    organization.joinRequest.splice(organization.joinRequest.indexOf(organization.joinRequest[index]), 1)
    await this.updateOrganization(organization)
    await this.updateUserData(user)
    console.log('Update organization success')
    console.log(await this.addNotice(user, '您通过了组织申请', '您申请的组织“'+this.data.organization.name+'”已同意您加入该组织'))
    feed.splice(index, 1)
    this.setData({
      feed: feed,
      organization: organization
    })
  },

  async refuse(e){
    var index = e.currentTarget.dataset.idx
    var organization = this.data.organization
    var feed = this.data.feed
    var user = feed[index]
    organization.joinRequest.splice(organization.joinRequest.indexOf(organization.joinRequest[index]), 1)
    await this.updateOrganization(organization)
    console.log('Update organization success')
    console.log(await this.addNotice(user, '您未能通过组织申请', '您申请的组织“'+this.data.organization.name+'”拒绝了您'))
    feed.splice(index, 1)
    this.setData({
      feed: feed,
      organization: organization
    })
  },

  getOrganizationOnce: function(){
    return new Promise((resolve => {
      wx.cloud.callFunction({
        name: 'getOneOrganization',
        data: {
          _id: this.data.organization._id
        }
      }).then(res => {
        resolve(res.result.data[0])
      })
    }))
  },

  updateOrganization: function(organization){
    return new Promise(function(resolve){
      wx.cloud.callFunction({
        name: 'updateAllOrganizationData',
        data: {
          _id: organization._id,
          activity: organization.activity,
          joinRequest: organization.joinRequest,
          member: organization.member
        }
      }).then(res =>{
        resolve(res)
      })
    })
  },

  updateUserData: function(user){
    return new Promise(function(resolve){
      wx.cloud.callFunction({
        name: 'updateAlluserdata',
        data: { // data是传进云函数的参数，内容是user的所有信息（因为打算其他地方也统一用这个函数所以所有信息都放进去了）
          userInfo: user.userInfo,
          belongTo: user.belongTo,
          collection: user.collection,
          participateIn: user.participateIn,
          school: user.school,
          studentid: user.studentid,
          hasUserinfo: user.hasUserinfo,
          hasIdentity: user.hasIdentity,
          openId: user._openid,
        },
      }).then(res => {
        resolve(res)
      })
    })
  },

  addNotice: function(user, title, description){
    var time = new Date()
    var hour = time.getHours()
    var min = time.getMinutes()
    if(hour < 10){
      hour = '0' + hour
    }
    if(min < 10){
      min = '0' + min
    }
    return new Promise(function(resolve){
      wx.cloud.callFunction({
        name: 'notice',
        data:{
          mode: 0,
          title: title,
          description: description,
          hasRead: false,
          occurTime: time.getFullYear() + '.' + time.getMonth() + '.' + time.getDate() + ' ' + hour + ':' + min,
          receive_openid: user._openid
        }
      }).then(res => {
        resolve(res)
      })
    })
  }
})
