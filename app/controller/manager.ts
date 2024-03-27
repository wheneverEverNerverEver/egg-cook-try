import { Controller } from 'egg';
import { Manager } from '../commonJs/type';

export default class RoleController extends Controller {
  public async addManager() {
    const { ctx } = this;
    const data: Manager = ctx.request.body;
    try {

      const result = await ctx.service.baseManagerOperate.insertManager({ ...data });
      ctx.body = result || { error: true };

    } catch (e) {
      console.log('addManager', e);
      ctx.body = { error: true };
    }
  }
  public async updateManager() {
    const { ctx } = this;
    const { _id, ...rest } = ctx.request.body;

    try {
      const result = await ctx.service.baseManagerOperate.updateManager(_id, { ...rest });
      ctx.body = result || { error: true };
    } catch (e) {
      console.log('updateManager', e);
      ctx.body = { error: true };
    }
  }
  public async deleteManager() {
    const { ctx } = this;
    const { id } = ctx.request.query;
    try {
      const result = await ctx.service.baseManagerOperate.deleteManage(id);
      ctx.body = result || { error: true };
    } catch (e) {
      console.log('deleteManager', e);
      ctx.body = { error: true };
    }
  }
  public async findManager() {
    const { ctx } = this;
    const search: any = ctx.request.query;
    try {
      const result = await ctx.service.baseManagerOperate.searchManager(search);
      ctx.body = result?.success && result;
    } catch (e) {
      ctx.body = { error: true };
    }
  }
}
