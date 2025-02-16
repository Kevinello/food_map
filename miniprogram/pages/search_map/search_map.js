const mta = require('../../vendor/mta_analysis.js');
const app = getApp();
const db = wx.cloud.database()
const store = db.collection('store');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    numbers: 0,
    stores: [],
    focus:false,
    searched:false,
	  searchKey:'TEST'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    mta.Page.init();
    this.setData({
      focus:true,
	  searchKey:options.searchKey
    })
	console.log("onload:"+this.data.searchKey)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  onReachBottom: function () {
    this.loadData();
  },
  loadData:function(keywords){
    store.skip(this.data.numbers).where({
      title: db.RegExp({
        regexp: this.data.keywords,
        options: 'i',
      })
    }).get().then(res => {
      /**
       * 如果没有数据，就提示没有商户了，并返回。
       */
      if (res.data.length == 0) {
        this.setData({
          searched:true
        })
      }
      this.setData({
        stores: this.data.stores.concat(res.data),
        numbers: this.data.numbers + res.data.length
      });
    })
  },
  updateSearchKey: function(e) {
    let that = this;
    if (e.detail.value.length < 1) {
      that.setData({
        searchKey: '',
      })
    } else {
      that.setData({
        searchKey: e.detail.value,
      })
    }
  },
  search:function(e){
    this.setData({
      keywords: this.data.searchKey
    },res => {
      this.loadData();
    }) 
  }
})