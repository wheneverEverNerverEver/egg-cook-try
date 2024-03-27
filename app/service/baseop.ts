import { Service } from 'egg';
import { changeSpecialCharacter, compactObj } from '../commonJs';
import { PageType, RoleType } from '../commonJs/type';


export default class baseOperate extends Service {
  /**
   * 新增
   */
  public async insertRole(userObj: RoleType) {
    const { ctx } = this;
    try {
      const userFind = await ctx.model.Role.insertMany([{ ...userObj }]);
      return userFind;
    } catch (error) {
      return false;
    }
  }
  /**
   * 编辑 findByIdAndUpdate
   */
  public async updateRole(id: string, updateObj: RoleType) {
    const { ctx } = this;
    try {
      compactObj(updateObj);
      const userFind = await ctx.model.Role.findByIdAndUpdate(
        {
          _id: id,
        },
        updateObj,
      );
      const userFind0 = userFind?.[0] ?? {};
      return userFind0;
    } catch (error) {
      return false;
    }
  }

  /**
   * 删除
   */
  public async deleteRole(id: string) {
    const { ctx } = this;
    try {
      await ctx.model.Role.deleteOne({
        _id: id,
      });
      const userHad = await ctx.model.User.find({ role: changeSpecialCharacter(id) });
      // 删除时相关用户角色也删除
      userHad.forEach(async v => {
        await ctx.model.User.findByIdAndUpdate(v._id, { role: undefined });
      });
      return true;
    } catch (error) {
      return false;
    }
  }
  public async searchRole(search: {
    limit: number;
    page: number;
  }) {
    const { limit = 99, page = 1 } = search;
    const { ctx } = this;

    const limitNumber = Number(limit) || 99;
    const pageNumber = Number(page) || 1;
    try {
      const data: RoleType[] = await ctx.model.Role.find()
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

      const outData = await Promise.all(data.map(async item => {
        const rolePage = item.pageCode;
        const pageCodeArr: PageType[] = [];
        if (rolePage) {
          for (let i = 0; i < rolePage.length; i++) {
            const thisPage: PageType[] = await ctx.model.Page.find({ pageCode: changeSpecialCharacter(rolePage[i]) });
            const thispage0 = thisPage?.[0];
            thispage0 && pageCodeArr.push({
              pageCode: thispage0.pageCode,
              pageName: thispage0.pageName,
            });
          }
        }
        return {
          _id: item._id,
          roleName: item.roleName,
          pageCodeArr,
        };

      }));


      const total = await ctx.model.Role.count();
      return {
        data: outData,
        total,
        success: true,
      };
    } catch (error) {
      console.log('======>>>>>>error', error);
      return {
        success: false,
      };
    }
  }
}
