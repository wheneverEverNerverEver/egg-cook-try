import { Controller } from 'egg';

export default class RoleController extends Controller {
  public async updateRole() {
    const { ctx } = this;
    const { id, pageCode } = ctx.request.body;
    try {

      if (Array.isArray(pageCode)) {
        const encodePageCode = pageCode.map(v => v);
        await ctx.service.baseRoleOperate.updateRole(id, { pageCode: encodePageCode });
        ctx.body = {
          error: false,
        };
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
  public async addNewRole() {
    const { ctx } = this;
    const { roleName, pageCode } = ctx.request.body;
    if (Array.isArray(pageCode)) {
      const encodePageCode = pageCode.map(v => v);
      await ctx.service.baseRoleOperate.insertRole({ roleName, pageCode: encodePageCode });
      ctx.body = {
        error: false,
      };
    } else {
      ctx.body = {
        error: true,
      };
    }
  }
  public async findRole() {
    const { ctx } = this;
    const search: any = ctx.request.query;
    try {
      const data = await ctx.service.baseRoleOperate.searchRole(search);
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
  public async deleteRole() {
    const { ctx } = this;
    const { id } = ctx.request.query;
    try {
      const result = await ctx.service.baseRoleOperate.deleteRole(id);
      ctx.body = result || { error: true };
    } catch (e) {
      console.log('deleteRole', e);
      ctx.body = { error: true };
    }
  }
}
