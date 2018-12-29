import wepy from 'wepy'

// 服务器接口地址

const host = 'https://vip.gtslfw.com/api'
// 普通请求
const request = async (options, showLoading = true) => {
    // 简化开发，如果传入字符串则转换成 对象
  if (typeof options === 'string') {
    options = {
      url: options
    }
  }
    // 显示加载中
  if (showLoading) {
    wepy.showLoading({title: '加载中'})
  }
    // 拼接请求地址
  options.url = host + '/' + options.url
    // 调用小程序的 request 方法
  let response = await wepy.request(options)

  if (showLoading) {
        // 隐藏加载中
    wepy.hideLoading()
  }

    // 服务器异常后给与提示
  if (response.statusCode === 500) {
    let rew = await wepy.showModal({
      title: '提示',
      content: '请先登录'
    })
    let page = getCurrentPages()
    wepy.setStorageSync('returnpage', '/' + page[page.length - 1]['route'])
    wepy.setStorageSync('returnoptions', page[page.length - 1]['options'])
    if (rew.errMsg === 'showModal:ok') {
      wepy.navigateTo({
        url: '/pages/login'
      })
    }
    // wepy.setStorageSync('returnpage', '/' + getCurrentPages()[1]['route'])
  }
  // 服务器异常后给与提示
  if (response.data.code === 999) {
    // 清楚所有storage
    wepy.clearStorageSync()
    // 获取页面信息
    let page = getCurrentPages()
    // 记录最后一页信息
    wepy.setStorageSync('returnpage', '/' + page[page.length - 1]['route'])
    // 记录最后一页页面参数
    wepy.setStorageSync('returnoptions', page[page.length - 1]['options'])
    // 返回登录页
    wepy.navigateTo({
      url: '/pages/login'
    })
  }
  return response
}

// 登录
const login = async (params = {}) => {
    // code 只能使用一次，所以每次单独调用
  let loginData = await wepy.login()

    // 参数中增加code
  params.code = loginData.code
  params.p_openid = wepy.getStorageSync('p_openid')
    // 接口请求 weapp/authorizations
  let authResponse = await request({
    url: 'login',
    data: params,
    method: 'POST'
  })

    // 登录成功，记录 token 信息
  if (authResponse.statusCode === 201) {
    wepy.setStorageSync('access_token', authResponse.data.access_token)
    wepy.setStorageSync('access_token_expired_at', new Date().getTime() + authResponse.data.expires_in * 1000)
  }

  return authResponse
}

export default {
  request,
  login,
  host
}
