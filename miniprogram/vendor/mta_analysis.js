var MTA_CONFIG = {
  app_id: "",
  event_id: "",
  api_base: "https://pingtas.qq.com/pingd",
  prefix: "_mta_",
  version: "1.3.6",
  stat_share_app: !1,
  stat_pull_down_fresh: !1,
  stat_reach_bottom: !1
};

function getNetworkType(a) {
  wx.getNetworkType({
    success: function (b) {
      a(b.networkType)
    }
  })
}

function getSystemInfo() {
  var a = wx.getSystemInfoSync();
  return {
    adt: encodeURIComponent(a.model),
    scl: a.pixelRatio,
    scr: a.windowWidth + "x" + a.windowHeight,
    lg: a.language,
    fl: a.version,
    jv: encodeURIComponent(a.system),
    tz: encodeURIComponent(a.platform)
  }
}

function getUID() {
  try {
    return wx.getStorageSync(MTA_CONFIG.prefix + "auid")
  } catch (a) {}
}

function setUID() {
  try {
    var a = getRandom();
    wx.setStorageSync(MTA_CONFIG.prefix + "auid", a);
    return a
  } catch (b) {}
}

function getSID() {
  try {
    return wx.getStorageSync(MTA_CONFIG.prefix + "ssid")
  } catch (a) {}
}

function setSID() {
  try {
    var a = "s" + getRandom();
    wx.setStorageSync(MTA_CONFIG.prefix + "ssid", a);
    return a
  } catch (b) {}
}

function getRandom(a) {
  for (var b = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], c = 10; 1 < c; c--) {
    var d = Math.floor(10 * Math.random()),
      f = b[d];
    b[d] = b[c - 1];
    b[c - 1] = f
  }
  for (c = d = 0; 5 > c; c++) d = 10 * d + b[c];
  return (a || "") + (d + "" + +new Date)
}

function getPagePath() {
  try {
    var a = getCurrentPages(),
      b = "/";
    0 < a.length && (b = a.pop().__route__);
    return b
  } catch (c) {
    console.log("get current page path error:" + c)
  }
}

function getMainInfo() {
  var a = {
    dm: "wechat.apps.xx",
    url: getPagePath(),
    pvi: "",
    si: "",
    ty: 0
  };
  a.pvi = function () {
    var b = getUID();
    b || (b = setUID(), a.ty = 1);
    return b
  }();
  a.si = function () {
    var a = getSID();
    a || (a = setSID());
    return a
  }();
  return a
}

function getBasicInfo() {
  var a = getSystemInfo();
  getNetworkType(function (a) {
    try {
      wx.setStorageSync(MTA_CONFIG.prefix + "ntdata", a)
    } catch (c) {}
  });
  a.ct = wx.getStorageSync(MTA_CONFIG.prefix + "ntdata") || "4g";
  return a
}

function getExtentInfo() {
  var a = MTA.Data.userInfo;
  var b = [],
    c;
  for (c in a) a.hasOwnProperty(c) && b.push(c + "=" + a[c]);
  a = b.join(";");
  return {
    r2: MTA_CONFIG.app_id,
    r4: "wx",
    ext: "v=" + MTA_CONFIG.version + (null !== a && "" !== a ? ";ui=" + encodeURIComponent(a) : "")
  }
}
var MTA = {
  App: {
    init: function (a) {
      "appID" in a && (MTA_CONFIG.app_id = a.appID);
      "eventID" in a && (MTA_CONFIG.event_id = a.eventID);
      "statShareApp" in a && (MTA_CONFIG.stat_share_app = a.statShareApp);
      "statPullDownFresh" in a && (MTA_CONFIG.stat_pull_down_fresh = a.statPullDownFresh);
      "statReachBottom" in a && (MTA_CONFIG.stat_reach_bottom = a.statReachBottom);
      setSID();
      try {
        "lauchOpts" in a && (MTA.Data.lanchInfo = a.lauchOpts, MTA.Data.lanchInfo.landing = 1)
      } catch (b) {}
    }
  },
  Page: {
    init: function () {
      var a = getCurrentPages()[getCurrentPages().length -
        1];
      a.onShow && ! function () {
        var b = a.onShow;
        a.onShow = function () {
          MTA.Page.stat();
          b.call(this, arguments)
        }
      }();
      MTA_CONFIG.stat_pull_down_fresh && a.onPullDownRefresh && ! function () {
        var b = a.onPullDownRefresh;
        a.onPullDownRefresh = function () {
          MTA.Event.stat(MTA_CONFIG.prefix + "pulldownfresh", {
            url: a.__route__
          });
          b.call(this, arguments)
        }
      }();
      MTA_CONFIG.stat_reach_bottom && a.onReachBottom && ! function () {
        var b = a.onReachBottom;
        a.onReachBottom = function () {
          MTA.Event.stat(MTA_CONFIG.prefix + "reachbottom", {
            url: a.__route__
          });
          b.call(this,
            arguments)
        }
      }();
      MTA_CONFIG.stat_share_app && a.onShareAppMessage && ! function () {
        var b = a.onShareAppMessage;
        a.onShareAppMessage = function () {
          MTA.Event.stat(MTA_CONFIG.prefix + "shareapp", {
            url: a.__route__
          });
          return b.call(this, arguments)
        }
      }()
    },
    multiStat: function (a, b) {
      if (1 == b) MTA.Page.stat(a), !0;
      else {
        var c = getCurrentPages()[getCurrentPages().length - 1];
        c.onShow && ! function () {
          var b = c.onShow;
          c.onShow = function () {
            MTA.Page.stat(a);
            b.call(this, arguments)
          }
        }()
      }
    },
    stat: function (a) {
      if ("" != MTA_CONFIG.app_id) {
        var b = [],
          c = getExtentInfo();
        a && (c.r2 = a);
        a = [getMainInfo(), c, getBasicInfo()];
        if (MTA.Data.lanchInfo) {
          a.push({
            ht: MTA.Data.lanchInfo.scene,
            rdm: "/",
            rurl: MTA.Data.lanchInfo.path
          });
          MTA.Data.lanchInfo.query && MTA.Data.lanchInfo.query._mta_ref_id && a.push({
            rarg: MTA.Data.lanchInfo.query._mta_ref_id
          });
          try {
            1 == MTA.Data.lanchInfo.landing && (c.ext += ";lp=1", MTA.Data.lanchInfo.landing = 0)
          } catch (e) {}
        }
        a.push({
          rand: +new Date
        });
        c = 0;
        for (var d = a.length; c < d; c++)
          for (var f in a[c]) a[c].hasOwnProperty(f) && b.push(f + "=" + ("undefined" == typeof a[c][f] ? "" : a[c][f]));
        wx.request({
          url: MTA_CONFIG.api_base + "?" + b.join("&").toLowerCase()
        })
      }
    }
  },
  Event: {
    stat: function (a, b) {
      if ("" != MTA_CONFIG.event_id) {
        var c = [],
          d = getMainInfo(),
          f = getExtentInfo();
        d.dm = "wxapps.click";
        d.url = a;
        f.r2 = MTA_CONFIG.event_id;
        var e = "undefined" === typeof b ? {} : b;
        var k = [],
          g;
        for (g in e) e.hasOwnProperty(g) && k.push(encodeURIComponent(g) + "=" + encodeURIComponent(e[g]));
        e = k.join(";");
        f.r5 = e;
        e = 0;
        d = [d, f, getBasicInfo(), {
          rand: +new Date
        }];
        for (f = d.length; e < f; e++)
          for (var h in d[e]) d[e].hasOwnProperty(h) && c.push(h + "=" + ("undefined" ==
            typeof d[e][h] ? "" : d[e][h]));
        wx.request({
          url: MTA_CONFIG.api_base + "?" + c.join("&").toLowerCase()
        })
      }
    }
  },
  Data: {
    userInfo: null,
    lanchInfo: null
  }
};
module.exports = MTA;