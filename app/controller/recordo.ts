import { Controller } from 'egg';

export default class RecordoController extends Controller {
  public async addrecordo() {
    return false;
  }
  public async findrecordo() {
    const { ctx } = this;
    const search = ctx.request.query;
    try {
      const data = await ctx.service.baseRecordoOperate.findLog(search);
      ctx.body = data ? data : { error: true };
    } catch (e) {
      console.error('=====>>>>>findrecordo error', e);
      ctx.body = { error: true };
    }
    return false;
  }
  public async deleteRecordo() {
    return false;
  }
}
