import { Controller } from 'egg';
import { PageType } from '../commonJs/type';

export default class PageController extends Controller {
  public async importPage() { /** 有且只有覆盖式导入权限 */
    const { ctx } = this;
    const fileOut: any[] = await ctx.service.uploadCustum.fileTurnToworsheet();

    try {
      if (fileOut.length > 0) {
        // 对比数据
        const filnalArray: Array<PageType> =
          (await ctx.service.basePageOperate.importPage(
            JSON.parse(fileOut[0])?.['导出数据'],
          )) || [];
        const filnalArrayLen = filnalArray.length;
        await ctx.model.Page.deleteMany({});
        for (let i = 0; i < filnalArrayLen; i++) {
          const itemNow = filnalArray[i];
          await ctx.service.basePageOperate.insertPage({
            ...itemNow,
          });

        }

        ctx.body = { error: false };
      } else {
        ctx.body = { error: true };
      }
    } catch (e) {
      console.log('======>>>>>>>importPage', e);
      ctx.body = { error: true };
    }
  }
  public async findPage() {
    const { ctx } = this;
    try {
      const data = await ctx.service.basePageOperate.searchPage();
      ctx.body = data || [];

    } catch (e) {
      ctx.body = [];
    }

  }
}
