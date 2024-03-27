import { indexOf } from 'lodash';
module.exports = (option, app) => {
  return async function checkIfLogin(ctx, next) {
    const findIn = indexOf(option.whiteList, ctx.request.path);
    const sessionUser = ctx?.session?.user;
    if (findIn > -1) {
      await next();
    } else {
      if (sessionUser) {
        const userID = await app.redis.get(sessionUser);
        if (userID) {
          await next();
        } else {
          ctx.status = 407;
          ctx.body = 'NEED LOGIN';
        }
      } else {
        ctx.status = 407;
        ctx.body = 'NEED LOGIN';
      }
    }
  };
};

