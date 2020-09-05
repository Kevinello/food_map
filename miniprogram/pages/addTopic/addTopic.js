// miniprogram/pages/addTopic/addTopic.js
var app = getApp();

// var _ = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //选择器数据
    index: null,
    picker: [],
    date: '2020-01-01',
    time: '12:00',
    allValue: {},
  },

  onLoad: function () {
    
  },

  onShow: function () {
    this.getMyOrganization(0)
  },

  async getMyOrganization(origin_length){
    var promises = []
    for (var i=origin_length; i<app.globalData.belongTo.length; i++){
      promises.push(this.getOrganizationOnce(i))
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
      this.set_picker() //set_picker放这儿才能同步操作
      console.log('My organizations: ', this.data.feed)
    }).catch((error) => {
      console.log(error)
    })
    
  },

  getOrganizationOnce: function(i){
    return new Promise((resolve => {
      wx.cloud.callFunction({
        name: 'getOneOrganization',
        data: {
          _id: app.globalData.belongTo[i]
        }
      }).then(res => {
        resolve(res.result.data[0])
      })
    }))
  },

  //获取用户所属的所有组织的名字并赋值给picker
  set_picker: function(){
    let picker = []
    let organizations = this.data.feed
    function getName(currentValue){
      picker.push(currentValue.name)
    }
    organizations.forEach(getName)
    this.setData({
      picker: picker
    })
  },

 //选择活动类型
    PickerChange(e) {
    console.log(e);
    this.setData({
      index: e.detail.value
    })
  },

  // 选择时间
  TimeChange(e) {
    this.setData({
      time: e.detail.value
    })
  },

  // 选择日期
  DateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },
  // 表单提交
  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    this.setData({
      allValue: e.detail.value
    })
    this.addTopic()
  },

   // 保存新建活动
   addTopic: function addTopic(e) {
    var getdata = this.data.allValue
    if(getdata.organization){
      const db = wx.cloud.database()
      var organization_id = this.data.feed[getdata.organization]._id
      var organization_type = this.data.feed[getdata.organization].type
      var organization_name = this.data.feed[getdata.organization].name
      if(this.data.feed[getdata.organization]._openid == app.globalData.openId){
        db.collection('Activity').add({
          data:{
              collect:0,
              description:getdata.description,
              holdPlace:getdata.holdPlace,
              memberTakeIn:[app.globalData.openId],
              membercollect:[],
              name:getdata.title,
              read:0,
              startTime:getdata.datePicker+" "+getdata.timePicker,
              userInfo: app.globalData.userInfo,
              organization_id: organization_id,
              organization_type: organization_type,
              organization_name: organization_name
            }
          }).then(res=>{
            console.log(res)
            app.globalData.participateIn.push(res._id)
            app.globalData.createactivity.push(res._id)
            app.globalData.recommendedActivity.unshift({
              _id: res._id,
              _openid: app.globalData.openId,
              collect:0,
              description:getdata.description,
              holdPlace:getdata.holdPlace,
              memberTakeIn:[app.globalData.openId],
              membercollect:[],
              name:getdata.title,
              read:0,
              startTime:getdata.datePicker+" "+getdata.timePicker,
              userInfo: app.globalData.userInfo,
              organization_id: organization_id,
              organization_type: organization_type,
              organization_name: organization_name
            })
            app.globalData.activityCount = app.globalData.activityCount + 1
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
                createactivity:app.globalData.createactivity
              },
              complete: res => {
                console.log('Update user success')
              }
            })
            let activity = this.data.feed[getdata.organization].activity
            activity.push(res._id)
            wx.cloud.callFunction({
              name: 'updateAllOrganizationData',
              data: {
                _id: organization_id,
                activity: activity,
                joinRequest: this.data.feed[getdata.organization].joinRequest,
                member: this.data.feed[getdata.organization].member,
              },
              complete: res => {
                console.log('Update organization success')
              }
            }),
            
            console.log("添加至數據庫成功",res),
            wx.navigateBack({
              complete: (res) => {
                wx.showToast({
                  title: '添加成功',
                  icon: 'success',
                  duration: 1000
                })
              },
            })
          }).catch(res=>{
            console.log("添加失敗",res)
          })
      }else{
        wx.navigateBack({
          complete: (res) => {},
        })
      }
    }else{
      wx.showToast({
        title: '请选择所属组织',
        icon: 'none',
        duration: 3000,
        image:"../../images/Tip.png"
      })
    }
    
   },
})