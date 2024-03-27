import { Service } from 'egg';
import { find } from 'lodash';
import { changeSpecialCharacter, compactObj } from '../commonJs';
import { LogType, UserType } from '../commonJs/type';

// 需要加日志的接口
const needLog = [{
  url: '/api/product/import',
  name: '导入了商品',
}, {
  url: '/api/product/add',
  name: '新增了商品',
}, {
  url: '/api/product/delete',
  name: '删除了商品',
}, {
  url: '/api/product/transformExcelyz',
  name: '转换了有赞订单',
}, {
  url: '/api/customer/importAll',
  name: '导入了客户信息',
}, {
  url: '/api/v2/product/importgj',
  name: '导入了管家婆商品信息',
}, {
  url: '/api/v2/product/importyz',
  name: '导入了有赞总部商品信息',
}, {
  url: '/api/v2/product/priceyz',
  name: '导入了有赞店铺商品价格',
}, {
  url: '/api/product/update',
  name: '编辑了商品',
}, {
  url: '/api/bill/image',
  name: '上传了订单详情图片',
}, {
  url: '/api/bill/update',
  name: '进行了确认已收款',
}];
export default class baseRecordoOperate extends Service {

  public async findLog(search: LogType & { limit?: number, page?: number }) {
    // operator 这里是用户名称的访问
    const { limit = 99, page = 1, operationDetail } = search;
    const { ctx } = this;

    const limitNumber = Number(limit) || 99;
    const pageNumber = Number(page) || 1;
    try {

      const searchParam = {
        operationDetail: operationDetail && { $regex: new RegExp(changeSpecialCharacter(operationDetail)), $options: 'i' },
      };

      compactObj(searchParam);
      const data: LogType[] = await ctx.model.Recordo.find({ ...searchParam }).sort('-operationTime')
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

      const outData = await Promise.all(data.map(async item => {
        const itemOp = item.operator;
        const thisOperate: UserType[] = await ctx.model.User.find({ _id: changeSpecialCharacter(itemOp) });

        return {
          _id: item._id,
          operationTime: item.operationTime,
          operationDetail: '【' + thisOperate?.[0]?.userName + '】' + item.operationDetail,
          operatorObj: thisOperate?.[0],
        };

      }));

      const total = await ctx.model.Recordo.where({ ...searchParam }).count();

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
  // 只保留三个月内的数据
  public async deleteLog() {
    const { ctx } = this;
    const baseNum = 7776000;
    const fiaTime = Date.now() - baseNum;
    try {
      await ctx.model.Recordo.deleteMany({ operationTime: { $lte: fiaTime } });
      return true;
    } catch (e) {
      return false;
    }
  }

  public async addLogOfLogInPerson(data?: LogType & { item?: string }) {
    const { ctx } = this;
    const urlNow = ctx.request.path;
    const { operationDetail = '', item = '' } = data || {};
    const personName = ctx.session.userName;
    const personId = ctx.session.id;
    const findUrlIndex = find(needLog, { url: urlNow });

    if (!personName || !(findUrlIndex?.url) || !personId) return false;

    try {
      const fiDe = '[' + findUrlIndex?.name + '] ' + operationDetail + item;
      await ctx.model.Recordo.insertMany([{ operator: personId, operationDetail: fiDe, operationTime: Date.now() }]);
      return true;
    } catch (e) {
      console.log('======>>>>>>addLog', e);
      return false;
    }
  }
}
