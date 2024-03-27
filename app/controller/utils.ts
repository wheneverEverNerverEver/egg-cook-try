import { Controller } from 'egg';

export default class UtilsController extends Controller {
  public async uploadFiles() {
    const { ctx } = this;
    try {
      const data = await ctx.service.utils.uploadsGit();
      if (data) {
        ctx.body = data;
      } else {
        ctx.body = {
          error: true,
        };
      }
    } catch (e) {
      ctx.body = {
        error: true,
      };
    }


  }

}
