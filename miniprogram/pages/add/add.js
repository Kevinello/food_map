const mta = require('../../vendor/mta_analysis.js');
const app = getApp();
const db = wx.cloud.database()
const store = db.collection('store');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    star: 3,
    currentPhoto: false,
    albumIndex: -1,
    albums: [],
    photosOrigin: [],
    photosNew: [],
    newphotos_url:[],
    index: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    mta.Page.init();
  },
  chooseLocation: function(event) {
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success: res => {
              wx.chooseLocation({
                success: res => {
                  this.setData({
                    address: res.address,
                    latitude: res.latitude,
                    longitude: res.longitude,
                    name: res.name
                  })
                }
              })
            }
          })
        } else {
          wx.chooseLocation({
            success: res => {
              this.setData({
                address: res.address,
                latitude: res.latitude,
                longitude: res.longitude,
                name: res.name
              })
            }
          })
        }
      }
    })

  },
  createItem: function(event) {
    wx.showLoading({
      title: '上传数据中...',
    })
    let value = event.detail.value
    store.add({
      data: {
        ...value,
        thumbs_up: 1,
        iconPath: "/images/food.png",
        longitude: this.data.longitude,
        latitude: this.data.latitude,
        label: {
          content: value.title,
          borderColor: "#FFCB01",
          borderRadius: "10rpx",
          borderWidth: "2px",
          color: "#5f5f5f",
          fontSize: "25rpx",
          padding: "5rpx"
        },
        images: this.data.images
      }
    }).then(res => {
      wx.hideLoading();
      wx.showToast({
        title: '创建成功！',
        icon: 'success',
        success: res => {
          wx.navigateBack({})
        }
      })
    }).catch(error => {
      console.error(error);
    })
  },
  formSubmit (e) {
    wx.showLoading({ title: '加载中' })

    // 并发上传图片
    const uploadTasks = this.data.photosNew.map(item => this.uploadPhoto(item.src))
    Promise.all(uploadTasks).then(result => {
        this.addPhotos(result, e.detail.value.desc)
        wx.hideLoading()
    }).catch(() => {
        wx.hideLoading()
        wx.showToast({ title: '上传图片错误', icon: 'error' })
    })
},

// 选择图片
chooseImage: function () {
    const items = this.data.photosNew

    wx.chooseImage({
        count: 9,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: res => {
            let tempFilePaths = res.tempFilePaths

            for (const tempFilePath of tempFilePaths) {
                items.push({
                    src: tempFilePath
                })
            }

            this.setData({ photosNew: items })
        }
    })
},

// 上传图片
uploadPhoto (filePath) {
  return wx.cloud.uploadFile({
    cloudPath: `${Date.now()}-${Math.floor(Math.random(0, 1) * 10000000)}.png`,
    filePath
})
},

// 预览图片
previewImage (e) {
    const current = e.target.dataset.src
    const photos = this.data.photosNew.map(photo => photo.src)

    wx.previewImage({
        current: current.src,
        urls: photos
    })
},

// 删除图片
cancel (e) {
    const index = e.currentTarget.dataset.index
    const photos = this.data.photosNew.filter((p, idx) => idx !== index)

    this.setData({
        photosNew: photos
    })
},

// 添加图片信息到数据库
addPhotos (photos, comment) {
    const db = wx.cloud.database()
    // 从全局数据中读出用户信息里的照片列表
    const oldPhotos = app.globalData.allData.albums[this.data.albumIndex].photos
    const albumPhotos = photos.map(photo => ({
        fileID: photo.fileID,
        comments: comment
    }))

    // 合并老照片的数组和新照片的数组
    app.globalData.allData.albums[this.data.albumIndex].photos = [...oldPhotos, ...albumPhotos]

   // 写入集合
db.collection('user').doc(app.globalData.id).update({
data: {
    albums: db.command.set(app.globalData.allData.albums)
}
}).then(result => {
console.log('写入成功', result)
wx.navigateBack()
})

},
  onStarChange(e) {
    const index = e.detail.index;
    this.setData({
      'star': index
    })
  },
})
