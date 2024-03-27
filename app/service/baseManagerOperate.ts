import { Service } from 'egg';
import { compactObj } from '../commonJs';
import { Manager } from '../commonJs/type';

/**
 * 角色的基本增删改查
 */
export default class baseManagerOperate extends Service {
  /**
   * 新增
   */
  public async insertManager(managerObj: Manager) {
    const { ctx } = this;
    try {
      const managerFind = await ctx.model.Manager.insertMany([{ ...managerObj, updateTime: Date.now() }]);
      return managerFind;
    } catch (error) {
      return false;
    }
  }
  /**
   * 编辑 findByIdAndUpdate
   */
  public async updateManager(id: string, updateObj: Record<string, any>) {
    const { ctx } = this;
    try {
      compactObj(updateObj);
      const managerFind = await ctx.model.Manager.findByIdAndUpdate(
        {
          _id: id,
        },
        { ...updateObj, updateTime: Date.now() },
      );
      return managerFind;
    } catch (error) {
      return false;
    }
  }

  /**
   * 删除
   */
  public async deleteManage(id: string) {
    const { ctx } = this;
    try {
      await ctx.model.Manager.deleteOne({
        _id: id,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
  public async searchManager(search: {
    nameSx: string;
    nameGj: string;
    limit: number;
    page: number;
    code: string;
  }) {
    const { limit = 99, page = 1 } = search;
    const { ctx } = this;

    const limitNumber = Number(limit) || 99;
    const pageNumber = Number(page) || 1;
    try {
      const data = await ctx.model.Manager.find()
        .sort('-updateTime')
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

      const total = await ctx.model.Manager.count();
      return {
        data,
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
