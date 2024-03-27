/* eslint-disable array-bracket-spacing */
import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  // override config from framework / plugin

  // add your egg config in here
  config.middleware = ['checkIfLogin', 'checkIfHadRight'];
  config.checkIfLogin = {
    whiteList: ['/api/login/account'],
  };
  config.checkIfHadRight = {
    whiteList: [
      '/api/login/account',
      '/api/logout/account',
      '/api/currentUser',
      '/api/account/find',
      '/api/product/transformExcel',
      '/api/product/transformExcelyz',
      '/api/v2/product/find',
      '/api/v2/product/download',
      '/api/department/find',
      '/api/customer/find',
      '/api/customer/transformYZSVC',
      '/api/bill/download',
      '/api/bill/find',
      '/api/role/authfind',
      '/api/role/find',
      '/api/log/find',
      '/api/department/findshowIfDic',
      '/api/after/find',
      '/api/v2/product/findOne',
    ],
  };

  // add your special config in here
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
  };

  const view = {
    mapping: {
      '.ejs': 'ejs',
    },
  };

  const cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
  };

  const multipart = {
    mode: 'file',
    whitelist: ['.xls', '.xlsx', '.png', 'jpeg', '.jpg', '.csv'],
  };

  const security = {
    csrf: {
      // 判断是否需要 ignore 的方法，请求上下文 context 作为第一个参数
      ignore: ctx => {
        if (ctx.request.url === '/api/login/account') {
          return true;
        }
        return false;
      },
    },
  };
  const session = {
    renew: true,
  };
  const redis = {
    client: {
      port: 6379, // Redis port
      host: '127.0.0.1', // Redis host
      password: '853656510Aa',
      db: 0,
    },
  };

  const cluster = {
    listen: {
      port: 7001,
      hostname: '127.0.0.1', // 不建议设置 hostname 为 '0.0.0.0'，它将允许来自外部网络和来源的连接，请在知晓风险的情况下使用
      // path: '/var/run/egg.sock',
    },
  };

  // the return config will combines to EggAppConfig
  return {
    ...config,
    ...bizConfig,
    view,
    cors,
    multipart,
    security,
    session,
    redis,
    cluster,
    keys: 'watermelonapple887912aabbcc',
  };
};
