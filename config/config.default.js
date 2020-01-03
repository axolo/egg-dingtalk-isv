'use strict';

/**
 * **egg-dingtalk-isv default config**
 *
 * 1. 支持在`Egg.js`里共存多个不同钉钉ISV应用
 * 2. 支持同一个钉钉ISV应用分布在不同的套件里
 * 3. 支持同一个套件里含多个不同钉钉ISV应用（钉钉20190412更新，一个套件仅能有一个应用）
 *
 * 钉钉相关参数取得参见钉钉开放平台文档{@link https://open-dev.dingtalk.com/}
 *
 * 以客户端配置的`suiteid`和`appid`，过滤从服务端得到的授权企业信息的应用列表信息，可获得当前应用`AgentId`用于生成`JSAPI`签名。
 *
 * ```js
 * const agentId = require('lodash').find(auth_info.agent, {
 *   suite: CLINET_CONFIG.dingtalk.suiteid,
 *   appid: CLINET_CONFIG.dingtalk.appid
 * })
 * ```
 *
 * @member Config#dingtalk
 * @property {String} SOME_KEY - some description
 */
exports.dingtalkIsv = {
  // 默认配置，配置钉钉API地址，令牌存储Redis等等
  default: {
    api: 'https://oapi.dingtalk.com', // 钉钉开放平台 Open API地址
    cache: { // 令牌及票据缓存
      store: 'memory',
      ttl: 7190, // 钉钉默认7200秒，容错10秒请求时间
    },
  },
  // 支持多实例，建议API以多级路由分开，如：app1.dingtalk.sign
  // client: {
  //   name: 'app1', // 钉钉ISV应用名称
  //   suites: [{ // 支持多套件对于同一个应用
  //     suiteId: 0, // 套件Id（注意：格式是Number）
  //     suiteKey: '', // 套件Key
  //     suiteSecret: '', // 套件Secret
  //     suiteTicket: '', // 钉钉给套件推送的ticket，测试应用可以随意填写
  //     appId: [], // 应用id列表，支持多个应用部署同一套系统，（注意：元素格式是Number）
  //   }]
  // }
};
