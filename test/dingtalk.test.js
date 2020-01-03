'use strict';

const mock = require('egg-mock');

describe('test/dingtalk.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/dingtalk-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, dingtalk')
      .expect(200);
  });
});
