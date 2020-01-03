'use strict';

const DingtalkIsv = require('./lib/dingtalk-isv');

const createDingtalkIsv = (config, app) => {
  const dingtalkIsv = new DingtalkIsv(config, app);
  return dingtalkIsv;
};

module.exports = app => {
  app.addSingleton('dingtalkIsv', createDingtalkIsv);
};
