'use strict';

const axios = require('axios');

class DingtalkIsvUser {

  /**
   * **egg-dingtalk-isv-user插件**
   *
   * @param {Object} config Egg.js插件配置
   * @param {Object} app Egg.js应用
   */
  constructor(config, app) {
    this.config = config;
    this.app = app;
  }

  /**
   * **从免登授权码获取用户简明信息**
   *
   * @see https://open-doc.dingtalk.com/microapp/serverapi3/xcdh0r
   * @param {String} access_token 令牌
   * @param {String} code 免登授权码
   * @return {Object} 用户简明信息
   * @memberof DingtalkIsvUser
   */
  async getUserInfo(access_token, code) {
    const method = 'GET';
    const url = `${this.config.api}/user/getuserinfo?access_token=${access_token}&code=${code}`;
    const { data: user } = await axios({ method, url });
    return user;
  }

  /**
   * **从用户编号获得用户详情信息**
   *
   * @see https://open-doc.dingtalk.com/microapp/serverapi3/momrx5
   * @param {String} access_token 令牌
   * @param {String} userid 用户编号
   * @return {Object} 用户详情信息
   * @memberof DingtalkIsvUser
   */
  async getUser(access_token, userid) {
    const method = 'GET';
    const url = `${this.config.api}/user/get?access_token=${access_token}&userid=${userid}`;
    const { data: user } = await axios({ method, url });
    return user;
  }

  /**
   * **从用户编号获得用户详情信息**
   *
   * @see https://open-doc.dingtalk.com/microapp/serverapi3/momrx5#-7
   * @param {String} access_token 令牌
   * @param {String} unionid 钉钉unionid
   * @return {Object} 用户编号
   * @memberof DingtalkIsvUser
   */
  async getUseridByUnionid(access_token, unionid) {
    const method = 'GET';
    const url = `${this.config.api}/user/getUseridByUnionid?access_token=${access_token}&unionid=${unionid}`;
    const { data: user } = await axios({ method, url });
    return user;
  }

}

module.exports = DingtalkIsvUser;
