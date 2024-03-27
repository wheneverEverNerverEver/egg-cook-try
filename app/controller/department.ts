/* eslint-disable array-bracket-spacing */
import { Controller } from 'egg';
import { changeSpecialCharacter, compactObj } from '../commonJs';
import { DepartmentType, LabelTypeDic } from '../commonJs/type';
import { includes } from 'lodash';

const labelTypeArr: LabelTypeDic[] = ['BELONG', 'CLASS', 'DEPARTENT', 'DISTRICT', 'STAFF', 'WAREHOUSE'];

export default class DepartmentController extends Controller {
  public async importDepartment() { // 覆盖式导入
    const { ctx } = this;
    const fileOut: any[] = await ctx.service.uploadCustum.fileTurnToworsheet();
    const { labelType }: Record<string, string> = ctx.request.query;

    if (!includes(labelTypeArr, labelType)) {
      ctx.body = 'false';
      return false;
    }


    try {
      if (fileOut.length > 0) {
        // 对比数据
        const filnalArray: Array<Record<'deName' | 'code', string>> =
          (await ctx.service.baseDepartmentOperate.importToDB(
            JSON.parse(fileOut[0])?.['导出数据'],
          )) || [];

        await ctx.model.Department.deleteMany({
          label: labelType,
        });

        const filnalArrayLen = filnalArray.length;
        for (let i = 0; i < filnalArrayLen; i++) {
          const itemNow = filnalArray[i];
          if (itemNow?.code) {
            await ctx.service.baseDepartmentOperate.insertDepartment({
              ...itemNow, label: labelType,
            });
          }
        }

        ctx.body = { error: false };
      } else {
        ctx.body = { error: true };
      }
    } catch (e) {
      console.log('======>>>>>>>importDepartment', e);
      ctx.body = { error: true };
    }
  }

  public async deleteDepartment() {
    const { ctx } = this;
    const data: Record<string, string> = ctx.request.query;

    try {
      await ctx.service.baseDepartmentOperate.deleteDepartment(data.id);
      ctx.body = { error: false };
    } catch (e) {
      ctx.body = { error: true };
    }
  }

  public async findDepartment() {
    const { ctx } = this;

    const { label, deName, limit = 99, page = 1, showInMenu, code }: Record<string, any> = ctx.request.query;

    try {
      const searchParam = {
        deName: deName && { $regex: new RegExp(changeSpecialCharacter(deName)), $options: 'i' },
        label: changeSpecialCharacter(label),
        showInMenu: showInMenu === 'true' ? true : undefined,
        code: changeSpecialCharacter(code),
      };

      compactObj(searchParam);
      const pageNumber = Number.parseInt(page) || 10;
      const limitNumber = Number.parseInt(limit) || 1;
      const allDate: DepartmentType[] = await ctx.model.Department.find({ ...searchParam })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

      const allDataFinal: DepartmentType[] = [];
      for (let i = 0; i < allDate.length; i++) {
        allDataFinal.push({
          deName: allDate[i]?.deName,
          code: allDate[i]?.code,
          label: allDate[i]?.label,
          showInMenu: allDate[i]?.showInMenu,
          _id: allDate[i]?._id,
        });
      }

      const total = await ctx.model.Department.where({ ...searchParam }).count();

      ctx.body = {
        data: allDataFinal,
        total,
      };
    } catch (e) {
      ctx.body = { error: true };
    }
  }
  public async changeShowDepartment() {
    const { ctx } = this;
    const data: Record<string, string> = ctx.request.query;

    try {
      await ctx.model.Department.findOneAndUpdate({ _id: data.id, label: 'DISTRICT' }, { showInMenu: data.showIf });
      ctx.body = { error: false };
    } catch (e) {
      ctx.body = { error: true };
    }
  }
  public async findShowDepartment() {
    const { ctx } = this;

    try {
      const allShowDate: DepartmentType[] = await ctx.model.Department.find({ label: 'DISTRICT', showInMenu: true });


      /** * 插入全部 */
      const totalAll = await ctx.model.Bill.where({}).count();
      const finallyData = [{
        deName: '全部',
        code: 'all',
        _id: 'all',
        count: totalAll,
      }];
      await Promise.all(allShowDate.map(async v => {
        const total = await ctx.model.Bill.where({ manager: v.code }).count();
        finallyData.push({
          deName: v.deName!,
          code: v.code!,
          _id: v._id!,
          count: total,
        });
      }));

      /** * 插入其他*/
      const dataOther: DepartmentType[] = await ctx.model.Department.find({ label: 'DISTRICT', showInMenu: { $nin: [true] } });
      const dataOtherFinal: string[] = dataOther?.map(v => v.code!) || [];

      const totalOther = await ctx.model.Bill.where(dataOtherFinal.length > 0 ? {
        manager: { $in: dataOtherFinal },
      } : {}).count();

      finallyData.push({
        deName: '其他',
        code: 'other',
        _id: 'other',
        count: totalOther,
      });

      ctx.body = {
        data: finallyData,
      };
    } catch (e) {
      ctx.body = { error: true };
    }
  }
}
