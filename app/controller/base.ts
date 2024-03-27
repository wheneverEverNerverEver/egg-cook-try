import { Controller } from 'egg';

export default class AftermarketController extends Controller {
  /** 新增 */
  public async addAftermarket() {
    const { ctx } = this;
    const search = ctx.request.body;
    try {
      const data = await ctx.service.baseRecordoOperate.findLog(search);
      ctx.body = data ? data : { error: true };
    } catch (e) {
      console.error('=====>>>>>findrecordo error', e);
      ctx.body = { error: true };
    }
  }
  /** 查询 */
  public async findAftermarket() {
    const { ctx } = this;
    const search = ctx.request.query;
    try {
      const data = await ctx.service.baseRecordoOperate.findLog(search);
      ctx.body = data ? data : { error: true };
    } catch (e) {
      console.error('=====>>>>>findrecordo error', e);
      ctx.body = { error: true };
    }
  }
  /** 删除 */
  public async deleteAftermarket() {
    const { ctx } = this;
    const search = ctx.request.query;
    try {
      const data = await ctx.service.baseRecordoOperate.findLog(search);
      ctx.body = data ? data : { error: true };
    } catch (e) {
      console.error('=====>>>>>findrecordo error', e);
      ctx.body = { error: true };
    }
  }
  /** 编辑 */
  public async editAftermarket() {
    const { ctx } = this;
    const search = ctx.request.query;
    try {
      const data = await ctx.service.baseRecordoOperate.findLog(search);
      ctx.body = data ? data : { error: true };
    } catch (e) {
      console.error('=====>>>>>findrecordo error', e);
      ctx.body = { error: true };
    }
  }
}
