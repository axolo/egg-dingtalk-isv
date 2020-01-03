'use strict';

const axios = require('axios');

class DingtalkIsvMessage {

  /**
   * **egg-dingtalk-isv-message插件**
   *
   * @param {Object} config Egg.js插件配置
   * @param {Object} app Egg.js应用
   */
  constructor(config, app) {
    this.config = config;
    this.app = app;
  }

  /**
   * **发送工作消息**
   *
   * @see https://open-doc.dingtalk.com/microapp/serverapi3/is3zms
   *
   * @param {String} access_token 令牌
   * @param {String} data 消息体
   * @return {Object} 发送结果
   * @memberof DingtalkIsvMessage
   */
  async notify(access_token, data) {
    const method = 'POST';
    const url = `${this.config.api}/topapi/message/corpconversation/asyncsend_v2?access_token=${access_token}`;
    const { data: message } = await axios({ method, url, data });
    return message;
  }

  /**
   * **发送普通消息**
   *
   * @see https://open-doc.dingtalk.com/microapp/serverapi3/wvdxel
   *
   * @param {String} access_token 令牌
   * @param {String} data 消息体
   * @return {Object} 发送结果
   * @memberof DingtalkIsvMessage
   */
  async chat(access_token, data) {
    const method = 'POST';
    const url = `${this.config.api}/message/send_to_conversation'?access_token=${access_token}`;
    const { data: message } = await axios({ method, url, data });
    return message;
  }

}

module.exports = DingtalkIsvMessage;
