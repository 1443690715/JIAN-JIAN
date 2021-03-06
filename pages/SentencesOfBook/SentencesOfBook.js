// pages/SentencesOfBook/SentencesOfBook.js
import { JJRequest } from '../../utils/util.js'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    sentencesChange: 0,

    share_or_delete: true, // true for share and false for delete 
    show_checkbox: false,
    rafted: false,
    checked_index: [],

    title: "",
    author: "",
    isbn: "",
    sentences: [ ],
    sentences_filter: [ ],

    motto: "Loading..."
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      isbn: options.isbn,
      title: options.title,
      author: options.author
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
      this.updateData();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  checkboxChange: function(e) {
    this.setData({
      checked_index: e.detail.value
    });
  },

  onAddSentenceClick: function (position) {
    var that = this;
    wx.showActionSheet({
      itemList: ['拍一拍（文字识别）', '写一写'],
      itemColor: '#000000',
      success: function (res) {
        switch (res.tapIndex) {
          case 0:
            // go to camera
            that.showCamera();
            break;
          case 1:
            // go to write
            // not good
            wx.navigateTo({
              url: '../newNote/newNote?isbn='+that.data.isbn,
              success: function () {
              },
              fail: function() {
                // ...
              }
            })
            break;
        }
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  }, 
  showWorking: function () {
    wx.showToast({
      title: '正在开发中',
      icon: '',
      image: '../../icons/working.png',
      duration: 1000,
      mask: true,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  showCamera: function () {
    var that = this;
    wx.navigateTo({
      url: '../Camera/Camera?isbn='+that.data.isbn,
      success: function (res) {
      },
      fail: function () {
        wx.showToast({
          title: '失败',
          icon: '',
          image: '../../icons/working.png',
          duration: 1000,
          mask: true,
          success: function (res) { },
          fail: function (res) { },
          complete: function (res) { },
        })
      }
    })
  },

  onDeleteSentenceClick: function(e) {
    this.setData({
      show_checkbox: true,
      share_or_delete: false
    });
  },

  onShareSentenceClick: function(e) {
    this.setData({
      show_checkbox: true,
      share_or_delete: true
    });
  },
  onRaftClick() {
    var that = this;
    wx.navigateTo({
      url: '../shareBook/shareBook?isbn=' + that.data.isbn + '&title=' + that.data.title + '&author=' + that.data.author
    })
  },
  cancelChecking: function(e) {
    this.setData({
      show_checkbox: false,
      checked_index: []
    });
  },

  shareChecking: function(e) {
    var that = this;
    var checked_sentence = [];
    var checked_id = [];
    if (that.data.checked_index.length === 0) {
      wx.showModal({
        title: '出错了！',
        content: '您还没有选择要分享的摘录',
        image: '../../images/request-fail.png'
      })
    } else {
      for (var i in that.data.checked_index) {
        console.log(i);
        checked_sentence.push(that.data.sentences[that.data.checked_index[i]].content);
        checked_id.push(that.data.sentences[that.data.checked_index[i]].sentence_id);
      }

      var share_info = {
        isbn: that.data.isbn,
        title: that.data.title,
        author: that.data.author,
        sentences_content: checked_sentence,
        sentences_id: checked_id
      }
      
      wx.setStorageSync('share_info', share_info);
      that.cancelChecking();
      wx.navigateTo({
        url: '../shareNote/shareNote'
      })
    }
  },

  deleteChecking: function(e) {
    var that = this;
    wx.showModal({
      title: '删除',
      content: '您将要删除这' + that.data.checked_index.length + '条书摘。',
      success: function(res) {
        if (res.confirm) {
          console.log("删除");
          var checked_value = [];
          for (var i in that.data.checked_index) {
            console.log(i);
            checked_value.push(that.data.sentences[that.data.checked_index[i]].sentence_id);
          }
          console.log(checked_value);
          JJRequest({
            url: getApp().globalData.baseUrl + '/sentence',
            method: 'DELETE',
            data: {
              sentence_id: checked_value
            },
            success: res => {
              console.log("delete seccessfully");
              getApp().globalData.sentencesChange++;  // 标记修改
              wx.redirectTo({
                url: '../SentencesOfBook/SentencesOfBook?isbn=' + that.data.isbn + '&title=' + that.data.title + '&author=' + that.data.author
              })
            },
            fail: res => {
              console.log(res);
            }
          })
        } else if (res.cancel) {
          console.log("取消删除操作");
        }

      }

    });
  },

  updateData: function() {
    var that = this;
    JJRequest({
      url: getApp().globalData.baseUrl + '/sentence?isbn=' + that.data.isbn,
      method: 'GET',
      success: res => {
        if (res.statusCode === 200) {
          console.log("get sentences successfully");
          console.log(res.data.data);
          that.setData({
            sentences: res.data.data,
            sentencesChange: getApp().globalData.sentencesChange,
            sentences_filter: res.data && res.data.data ? res.data.data.map(()=>true) : [],
            motto: "这本书还没有摘录噢，点击\"+\"添加一些吧！"
          });
          wx.setStorage({
            key: `sentece-isbn${that.data.isbn}`,
            data: res.data.data,
          })
        }
      }
    })
  },

  inputTyping(e) {
    this.setData({
      sentences_filter: this.data.sentences ? this.data.sentences.map((item) => {
        return (item.content.indexOf(e.detail.value) !== -1 || 
                item.thought.indexOf(e.detail.value) !== -1);
      }) : []
    })
  },

})