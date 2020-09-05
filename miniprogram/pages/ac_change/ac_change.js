// miniprogram/pages/ac_change/ac_change.js
var util = require('../../utils/util.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    index: '',
    picker: [],
    date: '',
    time: '',
    allValue : {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('onLoad')
    this.setData({
      _id: options._id,
      school: app.globalData.school,
      studentid: app.globalData.studentid,
    })
    this.getOneActivity()
    console.log(this.data)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('onShow')
    this.getMyOrganization(0)
  },


  getOneActivity: function(){
    wx.cloud.callFunction({
      name: 'getOneActivity',
      data: {
        _id: this.data._id
      },
      complete: res => {
        console.log('Get result: ', res.result.data[0])
        //console.log(res.result.data[0].membercollect.indexOf(this.data._id)==-1)
        //console.log(res.result.data[0].memberTakeIn.indexOf(this.data._id)==-1)
        let activity = res.result.data[0]
        this.setData({
          allValue: activity,
        })
        this.setData({
          organization: this.data.allValue.organization_name,
          date: this.data.allValue.startTime.substring(0,11),
          time: this.data.allValue.startTime.substring(12,16),
          introduction:this.data.allValue.description,
          place:this.data.allValue.holdPlace,
          title:this.data.allValue.name
        })
        // this.read()
        console.log(this.data.allValue)
      }
    })
  },

  read: function(){
    wx.cloud.callFunction({
      name: 'updateAllActivityData',
      data: {
        _id: this.data._id,
      },
      complete: res => {
        console.log('Update activity success: ', res)
      }
    })
  },

  //事件处理函数
  toQuestion: function() {
    wx.navigateTo({
      url: '../activity_admin/activity_admin'
    })
  },

  async getMyOrganization(origin_length){
    var promises = []
    for (var i=origin_length; i<Math.min(app.globalData.belongTo.length, origin_length+5); i++){
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
    this.changeTopic()
  },

   // 保存新建活动
   changeTopic: function changeTopic(e) {
    var getdata = this.data.allValue
    if(getdata.organization){
      const db = wx.cloud.database()
      console.log(this.data.feed)
      console.log(getdata)
      console.log(this.data)
        if(this.data.index!==''){
          var organization_id = this.data.feed[this.data.index]._id
          var organization_type = this.data.feed[this.data.index].type
          var organization_name = this.data.feed[this.data.index].name
           wx.cloud.callFunction({
            name: 'updateactivity',
            data:{
              mode:0,
              _id:this.data._id,
              description:getdata.description,
              holdPlace:getdata.holdPlace,
              name:getdata.title,
              startTime:getdata.datePicker+" "+getdata.timePicker,
              organization_id: organization_id,
              organization_type: organization_type,
              organization_name: organization_name
            }
           })
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
              wx.navigateBack({
                complete: (res) => {
                  wx.showToast({
                    title: '修改成功',
                    icon: 'success',
                    duration: 1000
                  })
                },
              })
            .catch(res=>{
              console.log("添加失敗",res)
            })
       }else{
        wx.cloud.callFunction({
          name: 'updateactivity',
          data:{
            mode:1,
            _id:this.data._id,
            description:getdata.description,
            holdPlace:getdata.holdPlace,
            name:getdata.title,
            startTime:getdata.datePicker+" "+getdata.timePicker,
          }
         })
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