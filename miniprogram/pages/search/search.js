//search.js
var util = require('../../utils/util.js')
var app = getApp()
Page({
  data: {
    feed_1: [],
    feed_1_pre: [],
    feed_2: [],
    feed_2_pre: [],
    navTab: ["火锅香锅", "汉堡披萨", "日韩料理", "快食简餐"],
    resTab: ["商家", "活动"],
    currentNavtab: 0,
    currentRestab: 0,
    search_src: "/images/search.jpg",
    searchFlag: false,
    keyword: "",
    hasUserinfo: false,
    hasIdentity: false,
  },
  onLoad: function (options) {
    this.getnosearchpages()
  },
  onShow: function () {
    this.setData({
      hasUserinfo: app.globalData.hasUserinfo,
      hasIdentity: app.globalData.hasIdentity,
    })
  },
  toSubString: function (value) {
    if (value.length >= 30) {
      return value.substring(0, value.length)
    } else {
      return value
    }
  },
  getInput: function (e) {
    this.setData({
      keyword: this.toSubString(e.detail.value)
    })
  },
  jump_more: function () {
    wx.switchTab({
      url: '../more/more',
    }) // 跳转到more
    console.log("Back to page more.")
  },
  bindItemTap: function (e) {
    var index = e.currentTarget.dataset.idx
    console.log('index: ', index)
    var _id = this.data.feed_2[index]._id

    wx.navigateTo({
      url: '../answer/answer?_id=' + _id
    })
  },

  switchTab1: function (e) {
    this.setData({
      currentNavtab: e.currentTarget.dataset.idx,
      feed_1: [],
      feed_2: []
    });
    this.getnosearchpages()
    console.log("currentNavtab: ", this.data.currentNavtab)
  },
  switchTab2: function (e) {
    this.setData({
      currentRestab: e.currentTarget.dataset.idx,
      feed_1: [],
      feed_2: []
    });
    this.getnosearchpages()
    console.log("currentRestab: ", this.data.currentRestab)
  },

  //创建新的活动
  addTopic: function addTopic() {
    wx.navigateTo({
      url: "../addTopic/addTopic"
    })
  },

  async search() {
    this.setData({
      searchFlag: true
    })
    switch (this.data.currentRestab) {
      case 0: {
        this.setData({
          feed_1: [],
          OrganizationCount: await this.getOrganizationCount()
        })
        this.setData({
          skipLength: Math.max(0, this.data.OrganizationCount - 20)
        })
        break
      }
      case 1: {
        this.setData({
          feed_2: [],
          ActivityCount: await this.getActivityCount()
        })
        this.setData({
          skipLength: Math.max(0, this.data.ActivityCount - 20)
        })
        break
      }
    }
    this.searchMain(this.data.skipLength)
  },

  async searchMain(skipLength) {
    var hasGet = 0
    console.log('hasGet: ', hasGet)
    console.log('skipLength: ', skipLength)
    while (hasGet <= 10 && skipLength > -20) {
      console.log('start search')
      hasGet = await this.searchOnce(hasGet, skipLength)
      skipLength -= 20
      console.log('hasGet: ', hasGet)
      console.log('skipLength: ', skipLength)
    }
    if (hasGet == 0) {
      wx.showToast({
        title: '无搜索结果',
        icon: 'none',
        duration: 1000,
        image: "../../images/Tip.png"
      })
    }
    this.setData({
      skipLength: skipLength
    })
  },

  searchOnce: function (hasGet, skipLength) {
    var patternNormal = new RegExp(this.data.keyword, 'img')

    function checkRelate(item) {
      return item.relateValue > 0
    }
    return new Promise((resolve) => {
      console.log('keyword: ', this.data.keyword)
      switch (this.data.currentNavtab) {
        case 0: {
          var type = "studioActivity"
          break
        }
        case 1: {
          var type = "clubActivity"
          break
        }
        case 2: {
          var type = "teachingTeamActivity"
          break
        }
        case 3: {
          var type = "otherActivity"
          break
        }
      }
      console.log('searchMode: ', type)
      switch (this.data.currentRestab) {
        case 0: {
          wx.cloud.callFunction({
            name: 'search',
            data: {
              keyword: this.data.keyword,
              skipLength: skipLength,
              resType: this.data.currentRestab
            }
          }).then(res => {
            var getResult = res.result.data
            console.log('getResult: ', getResult)
            if (getResult.length > 0) {
              var searchRes = []
              for (let index = 0; index < getResult.length; index++) {
                const element = getResult[index];
                if (element.type == type) {
                  searchRes.push(element)
                }
              }

              function getRelateValue1(item) {
                item.relateValue = (item.name.match(patternNormal) ? item.name.match(patternNormal).length : 0) * 10 +
                  (item.description.match(patternNormal) ? item.description.match(patternNormal).length : 0) * 5
                if (item.relateValue > 0) {
                  item.relateValue = item.relateValue + item.activity.length * 1 + item.joinRequest.length * 1 + item.member.length * 2
                }
              }
              searchRes.forEach(getRelateValue1)
              searchRes = searchRes.filter(checkRelate)
              searchRes.sort((a, b) => b.relateValue - a.relateValue)
              this.setData({
                feed_1: this.data.feed_1.concat(searchRes)
              })
              console.log('search: ', this.data.feed_1)
              hasGet = hasGet + searchRes.length
            }
            resolve(hasGet)
          })
          break
        }
        case 1: {
          wx.cloud.callFunction({
            name: 'search',
            data: {
              keyword: this.data.keyword,
              skipLength: skipLength,
              resType: this.data.currentRestab
            }
          }).then(res => {
            var getResult = res.result.data
            console.log('getResult: ', getResult)
            if (getResult.length > 0) {
              var searchRes = []
              for (let index = 0; index < getResult.length; index++) {
                const element = getResult[index];
                if (element.organization_type == type) {
                  searchRes.push(element)
                }
              }

              function getRelateValue2(item) {
                item.relateValue = (item.name.match(patternNormal) ? item.name.match(patternNormal).length : 0) * 10 +
                  (item.description.match(patternNormal) ? item.description.match(patternNormal).length : 0) * 5 +
                  (item.organization_name.match(patternNormal) ? item.organization_name.match(patternNormal).length : 0) * 9 +
                  (item.holdPlace.match(patternNormal) ? item.holdPlace.match(patternNormal).length : 0) * 5
                if (item.relateValue > 0) {
                  item.relateValue = item.relateValue + item.read * 0.4 + item.collect * 1 + item.memberTakeIn.length * 2
                }
              }
              searchRes.forEach(getRelateValue2)
              searchRes = searchRes.filter(checkRelate)
              searchRes.sort((a, b) => b.relateValue - a.relateValue)
              this.setData({
                feed_2: this.data.feed_2.concat(searchRes)
              })
              console.log('search: ', this.data.feed_2)
              hasGet = hasGet + searchRes.length
            }
            resolve(hasGet)
          })
          break
        }
      }
    })
  },

  collectActivity: function (e) {
    //云开发数据库更改记录
    var index = e.currentTarget.dataset.idx
    var feed_2 = this.data.feed_2
    if (app.globalData.collection.indexOf(feed_2[index]._id) == -1) {
      feed_2[index].collect += 1
      app.globalData.collection.push(feed_2[index]._id)
      this.setData({
        feed_2: feed_2,
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
        },
        complete: res => {
          console.log('Update user success')
        }
      })
      wx.cloud.callFunction({
        name: 'updateAllActivityData',
        data: {
          _id: feed_2[index]._id,
          collect: feed_2[index].collect,
          read: feed_2[index].read,
          memberTakeIn: feed_2[index].memberTakeIn,
        },
        complete: res => {
          console.log('Update activity success')
        }
      })
    } else {
      console.log("You have collected this activity")
    }
  },

  participateInActivity: function (e) {
    var index = e.currentTarget.dataset.idx
    var feed_2 = this.data.feed_2
    if (app.globalData.participateIn.indexOf(feed_2[index]._id) == -1) {
      feed_2[index].memberTakeIn.push(app.globalData.openId)
      app.globalData.participateIn.push(feed_2[index]._id)
      this.setData({
        feed_2: feed_2
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
        },
        complete: res => {
          console.log('Update user success')
        }
      })
      wx.cloud.callFunction({
        name: 'updateAllActivityData',
        data: {
          _id: feed_2[index]._id,
          collect: feed_2[index].collect,
          read: feed_2[index].read,
          memberTakeIn: feed_2[index].memberTakeIn,
        },
        complete: res => {
          console.log('Update activity success')
        }
      })
    } else {
      console.log("You have participated in this activity")
    }
  },

  joinOrganization: function (e) {
    var index = e.currentTarget.dataset.idx
    if (this.data.feed_1[index].joinRequest.indexOf(app.globalData.openId) != -1) {
      wx.showToast({
        title: '已申请过该组织',
        icon: 'none',
        duration: 3000,
        image: "../../images/Tip.png"
      })
      return
    } else if (this.data.feed_1[index].member.indexOf(app.globalData.openId) != -1) {
      wx.showToast({
        title: '已是该美食群成员',
        icon: 'none',
        duration: 3000,
        image: "../../images/Tip.png"
      })
      return
    }
    var joinRequest = this.data.feed_1[index].joinRequest
    joinRequest.push(app.globalData.openId)
    wx.cloud.callFunction({
      name: 'updateAllOrganizationData',
      data: {
        _id: this.data.feed_1[index]._id,
        activity: this.data.feed_1[index].activity,
        joinRequest: joinRequest,
        member: this.data.feed_1[index].member
      }
    }).then(res => {
      console.log('Update organization success')
      wx.showToast({
        title: '已发出加入申请',
        icon: 'success',
        duration: 3000,
      })
    })
  },

  getActivityCount: function () {
    return new Promise((resolve => {
      wx.cloud.callFunction({
        name: 'getCount',
        data: {
          collectionName: 'Activity'
        }
      }).then(res => {
        resolve(res.result.total)
      })
    }))
  },

  getOrganizationCount: function () {
    return new Promise((resolve => {
      wx.cloud.callFunction({
        name: 'getCount',
        data: {
          collectionName: 'organization'
        }
      }).then(res => {
        resolve(res.result.total)
      })
    }))
  },

  getnosearchpages: function () {
    return new Promise((resolve) => {
      switch (this.data.currentNavtab) {
        case 0: {
          var type = "studioActivity"
          break
        }
        case 1: {
          var type = "clubActivity"
          break
        }
        case 2: {
          var type = "teachingTeamActivity"
          break
        }
        case 3: {
          var type = "otherActivity"
          break
        }
      }

      switch (this.data.currentRestab) { //从数据库获取
        case 0: {
          console.log('skipLength: ', this.data.feed_1.length)
          wx.cloud.callFunction({
            // 要调用的云函数名称
            name: 'nosearch',
            // 传递给云函数的event参数
            data: {
              navType: type,
              resType: this.data.currentRestab,
              skipLength: this.data.feed_1.length
            }
          }).then(res => {
            this.setData({
              feed_1: this.data.feed_1.concat(res.result.data)
            })
            console.log("成功！", this.data.feed_1)
            resolve()
          })
          break
        }
        case 1: {
          console.log('skipLength: ', this.data.feed_1.length)
          wx.cloud.callFunction({
            // 要调用的云函数名称
            name: 'nosearch',
            // 传递给云函数的event参数
            data: {
              navType: type,
              resType: this.data.currentRestab,
              skipLength: this.data.feed_2.length
            }
          }).then(res => {
            this.setData({
              feed_2: this.data.feed_2.concat(res.result.data)
            })
            console.log("成功！", this.data.feed_2)
            resolve()
          })
          break
        }
      }
    })
  },

  refresh: function () {
    wx.showLoading({
      title: '刷新中',
    })
    wx.showNavigationBarLoading()
    console.log("refresh")
    console.log("loaddata");
    this.setData({
      feed_1: [],
      feed_2: [],
      searchFlag: false
    })
    this.getnosearchpages().then(res => {
      console.log('refresh done')
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1000
      })
      wx.hideNavigationBarLoading()
    })
  },

  lower: function () {
    wx.showNavigationBarLoading()
    console.log("lower")
    this.nextLoad()
  },

  nextLoad: function () {
    wx.showLoading({
      title: '加载中',
      duration: 300
    })
    if (this.data.searchFlag) {
      this.searchMain(this.data.skipLength).then(res => {
        console.log('nextload done')
        wx.showToast({
          title: '加载成功',
          icon: 'success',
          duration: 300
        })
        wx.hideNavigationBarLoading()
      })
    } else {
      this.getnosearchpages().then(res => {
        console.log('nextload done')
        // wx.showToast({
        //   title: '加载成功',
        //   icon: 'success',
        //   duration: 1000
        // })
        wx.hideNavigationBarLoading()
      })
    }
  },
})