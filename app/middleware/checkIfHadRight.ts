import { indexOf, find } from 'lodash';

module.exports = option => {
  return async function checkIfHadRight(ctx, next) {
    // 当前链接与白名单比对
    const urlNow = ctx.request.path;
    const findWhiteIndex = indexOf(option.whiteList, urlNow);
    if (findWhiteIndex < 0) {
      const roleRight = JSON.parse(ctx.session.roleRight);
      // 不在白名单内，判断是否在权限里
      const findInThis = find(roleRight, { url: urlNow });
      if (findInThis?.url) { // 有
        await next();
      } else { // 没有
        ctx.status = 403;
        ctx.body = {
          error: 'NEED AUTH',
        };
      }
    } else {
      await next();
    }
  };
};
