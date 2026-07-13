export default defineNuxtConfig({
  // 关闭默认的欢迎页和 UI 框架，纯接口服务
  app: {
    head: {
      title: 'Base64 Decoder API'
    }
  },
  nitro: {
    // 生产环境也打印请求日志，方便调试
    logLevel: 3
  }
})
