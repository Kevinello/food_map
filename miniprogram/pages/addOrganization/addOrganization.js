// miniprogram/pages/addOrganization/addOrganization.js
var app = getApp();

// var _ = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //选择器数据
    index: null,
    picker: ["火锅香锅", "汉堡披萨", "日韩料理", "快食简餐"],
    allValue: {}
  },

  //选择组织类型
  PickerChange(e) {
    console.log(e);
    this.setData({
      index: e.detail.value
    })
  },

  // 表单提交
  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    this.setData({
      allValue: e.detail.value
    })
    this.addOrganization()
  },

  // 保存新建组织
  addOrganization: function addOrganization(e) {
    var getdata = this.data.allValue
    if (getdata.type && getdata.title && getdata.description) {
      const db = wx.cloud.database()
      switch (getdata.type) {
        case "0":
          var type = "studioActivity";
          break;
        case "1":
          var type = "clubActivity";
          break;
        case "2":
          var type = "teachingTeamActivity";
          break;
        default:
          var type = "otherActivity"; // 默认为其它
          break;
      }
      db.collection('organization').where({
        name: getdata.title
      }).get({
        success: function (res) {
          if (res.data.length == 0) {
            db.collection('organization').add({
              data: {
                description: getdata.description,
                activity: [],
                member: [app.globalData.openId],
                joinRequest: [],
                name: getdata.title,
                creator_userInfo: app.globalData.userInfo,
                type: type,
              }
            }).then(res => {
              console.log("添加至數據庫成功", res)
              let belongTo = app.globalData.belongTo
              belongTo.push(res._id)
              app.globalData.belongTo = belongTo
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
                  console.log('Update user success', res)
                  wx.showToast({
                    title: '创建成功',
                    icon: 'success',
                    image: '../../images/Tip.png',
                    duration: 2000
                  })
                  wx.navigateBack({
                    complete: (res) => {},
                  })
                }
              })
            }).catch(res => {
              console.log("添加失敗", res)
            })
          } else {
            wx.showToast({
              title: '组织已存在',
              icon: 'success',
              image: '../../images/Tip.png',
              duration: 2000
            })
          }
        }
      })
    } else {
      setTimeout(function () {
        wx.showToast({
          title: '请完善组织信息',
          icon: 'none',
          duration: 1500,
          image: "../../images/Tip.png"
        })
      }, 1000)
    }

  },
})