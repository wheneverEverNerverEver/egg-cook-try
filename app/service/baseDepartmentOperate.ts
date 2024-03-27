/* eslint-disable jsdoc/check-param-names */
import { Service } from 'egg';
import { findIndex } from '../commonJs';

/**
 * 页面的基本增删改查
 */
export default class basePageOperate extends Service {
  /**
   * 新增
   */
  public async insertDepartment(pageObj: { deName: string; code: string; label: string }) {
    const { ctx } = this;
    try {
      const pageFind = await ctx.model.Department.insertMany([{ ...pageObj }]);
      return pageFind;
    } catch (error) {
      console.log('=====>>>>insertDepartment', error);
      return false;
    }
  }

  /**
   * 删除
   */
  public async deleteDepartment(id: string) {
    const { ctx } = this;
    try {
      await ctx.model.Department.deleteOne({
        _id: id,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
  /** 导入数据 */
  public async importToDB(arrData: Array<any>) {
    const fileDataLength = arrData.length;
    if (fileDataLength < 1) {
      return [];
    }
    const arrData0 = arrData[0];
    // 找到对应的下标
    const codeIdSx = findIndex(arrData0, '编号');
    const deName = findIndex(arrData0, '名称');
    const status = findIndex(arrData0, '状态');

    const dataInner: Array<Record<string, any>> = [];

    for (let k = 1; k < fileDataLength; k++) {
      const nowCode = arrData[k][codeIdSx];
      const nowname = arrData[k][deName];
      const nowStatus = arrData[k][status];
      if (nowname && !nowStatus && nowCode) {
        dataInner.push({
          code: nowCode + '',
          deName: nowname,
        });
      }
    }
    return dataInner;
  }
}
