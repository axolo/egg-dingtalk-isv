'use strict';

const _ = require('lodash');
const crypto = require('crypto');
const axios = require('axios');
const cacheManager = require('cache-manager');
const DingTalkEncrypt = require('dingtalk-encrypt');

class DingtalkIsv {

  /**
   * **egg-dingtalk-isv插件**
   *
   * @param {Object} config Egg.js插件配置
   * @param {Object} app Egg.js应用
   */
  constructor(config, app) {
    this.config = config;
    this.app = app;
    this.cache = cacheManager.caching(this.config.cache);
  }

  /**
   * @property {Object} 钉钉ISV应用服务端API用户模块
   * @readonly
   * @memberof DingtalkIsv
   */
  get user() {
    const DingtalkIsvUser = require('./dingtalk-isv-user');
    return new DingtalkIsvUser(this.config, this.app);
  }

  /**
   * @property {Object} 钉钉ISV应用服务端API用户模块
   * @readonly
   * @memberof DingtalkIsv
   */
  get message() {
    const DingtalkIsvMessage = require('./dingtalk-isv-message');
    return new DingtalkIsvMessage(this.config, this.app);
  }

  /**
   * **加密器**
   *
   * @see https://ding-doc.dingtalk.com/doc#/serverapi3/igq88i
   * @see https://github.com/elixirChain/dingtalk-encrypt
   *
   * @readonly
   * @memberof DingtalkIsv
   */
  get encrypt() {
    return DingTalkEncrypt;
  }

  /**
   * **获取缓存**
   *
   * @param {String} key 键
   * @return {Promise} 缓存
   * @memberof DingtalkIsv
   */
  getCache(key) {
    return new Promise((resolve, reject) => {
      this.cache.get(key, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });
  }

  /**
   * **设置缓存**
   *
   * @param {String} key 键
   * @param {Any} val 值
   * @param {Object} options 选项
   * @return {Promise} 缓存
   * @memberof DingtalkIsv
   */
  setCache(key, val, options) {
    return new Promise((resolve, reject) => {
      this.cache.set(key, val, options, err => {
        if (err) return reject(err);
        return resolve(this.getCache(key));
      });
    });
  }

  /**
   * **ISV应用获取授企业令牌**
   *
   * @see https://open-doc.dingtalk.com/microapp/serverapi3/hv357q
   * @see https://github.com/BryanDonovan/node-cache-manager
   *
   * @param {String} auth_corpid 授权企业编号
   * @param {String} suiteid 套件编号
   * @return {String} 授权企业令牌
   * @memberof DingtalkIsv
   */
  async getCorpToken(auth_corpid, suiteid) {
    const { config } = this;
    const key = [ 'token', auth_corpid, suiteid ].join('_');
    const cache = await this.getCache(key);
    if (cache) return cache;
    const suite = _.find(config.suites, { suiteId: parseInt(suiteid) });
    if (!suite) return;
    const timestamp = new Date().getTime();
    const suiteKey = suite.suiteKey;
    const suiteSecret = suite.suiteSecret;
    const suiteTicket = suite.suiteTicket;
    const signature = this.genSignature(suiteSecret, suiteTicket, timestamp);
    const url = config.api +
      '/service/get_corp_token' +
      '?accessKey=' + suiteKey +
      '&timestamp=' + timestamp +
      '&suiteTicket=' + suiteTicket +
      '&signature=' + signature;
    const { data: token } = await axios({ method: 'POST', url, data: { auth_corpid } });
    token && !token.errcode && this.setCache(key, token, { ttl: token.expires_in });
    return token;
  }

  /**
   * **JSAPI鉴权获取JSAPI票据**
   *
   * @see https://open-doc.dingtalk.com/microapp/dev/uwa7vs
   * @param {String} access_token 令牌，调用接口凭证
   * @param {String} type 类型，目前支支持jsapi
   * @return {Object} 票据信息
   * @memberof DingtalkIsv
   */
  async getJsapiTicket(access_token, type = 'jsapi') {
    const { config } = this;
    const key = [ 'jsapi', access_token ].join('_');
    const cache = await this.getCache(key);
    if (cache) return cache;
    const url = config.api
      + '/get_jsapi_ticket'
      + '?access_token=' + access_token
      + '&type=' + type;
    const { data: ticket } = await axios({ method: 'GET', url });
    ticket && !ticket.errcode && this.setCache(key, ticket, { ttl: ticket.expires_in });
    return ticket;
  }

  /**
   * **ISV应用获取授权企业信息**
   *
   * - 企业信息：`auth_corp_info`
   * - 应用列表：`auth_info.agent`
   * - 当前应用：以客户端配置的`appid`过滤应用列表信息
   *   如：`require('lodash').find(auth_info.agent, { appid: CLINET_CONFIG.dingtalk.appid })`
   *
   * @see https://open-doc.dingtalk.com/microapp/serverapi3/fmdqvx
   * @param {String} auth_corpid 授权企业编号
   * @param {String} suiteid 套件编号
   * @return {String} 授权企业信息
   * @memberof DingtalkIsv
   */
  async getAuthInfo(auth_corpid, suiteid) {
    const config = this.config;
    const suite = _.find(config.suites, { suiteId: parseInt(suiteid) });
    if (!suite) return;
    const timestamp = new Date().getTime();
    const { suiteKey, suiteSecret, suiteTicket } = suite;
    const signature = this.genSignature(suiteSecret, suiteTicket, timestamp);
    const url = config.api
      + '/service/get_auth_info'
      + '?accessKey=' + suiteKey
      + '&timestamp=' + timestamp
      + '&suiteTicket=' + suiteTicket
      + '&signature=' + signature;
    const { data: authinfo } = await axios({ method: 'POST', url, data: { auth_corpid } });
    return authinfo;
  }

  /**
   * **ISV应用获取授权应用详细信息**
   *
   * @see https://open-doc.dingtalk.com/microapp/serverapi3/vfitg0
   * @param {String} suite_key 套件Key
   * @param {String} auth_corpid 授权企业编号
   * @param {Number} agentid 企业应用编号
   * @return {String} 授权应用信息
   * @memberof DingtalkIsv
   */
  async getAgentInfo(suite_key, auth_corpid, agentid) {
    const config = this.config;
    const timestamp = new Date().getTime();
    const { suiteKey, suiteSecret, suiteTicket } = config;
    const signature = this.genSignature(suiteSecret, suiteTicket, timestamp);
    const url = config.api
      + '/service/get_agent'
      + '?accessKey=' + suiteKey
      + '&timestamp=' + timestamp
      + '&suiteTicket=' + suiteTicket
      + '&signature=' + signature;
    const { data: agent } = await axios({ method: 'POST', url, data: { suite_key, auth_corpid, agentid } });
    return agent;
  }

  /**
   * **生成三方访问接口签名**
   *
   * @see https://open-doc.dingtalk.com/microapp/faquestions/oh7ngo
   * @param {String} suiteSecret 钉钉应用套件`suiteSecret`
   * @param {String} suiteTicket 钉钉应用套件`suiteTicket`
   * @param {String} timestamp 时间戳
   * @return {String} 签名
   * @memberof DingtalkIsv
   */
  genSignature(suiteSecret, suiteTicket, timestamp) {
    return encodeURIComponent(crypto
      .createHmac('SHA256', suiteSecret)
      .update(timestamp + '\n' + suiteTicket)
      .digest('base64'));
  }

}

module.exports = DingtalkIsv;
