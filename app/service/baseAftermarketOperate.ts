import { Service } from 'egg';
import { changeSpecialCharacter, compactObj } from '../commonJs';
import { AftermarketDetailType, AftermarketReason, AftermarketType, CustomerType, DepartmentType, UserType } from '../commonJs/type';


export default class baseAftermarketOperate extends Service {
  /**
   * 新增
   */
  public async insertAftermarket(Obj: AftermarketType) {
    const { ctx } = this;
    try {
      const {
        customer,
        reason, /** 售后原因 */
        orderCode, /** 订单编号 */
        delivery, /** 售后配送员*/
        imgFromCus, /** 售后截图*/
        imgFromWebHref, /** 使用超链接*/
        imgRefund, /** 售后退款截图*/
        reasonType,
      } = Obj;
      const userFind = await ctx.model.Aftermarket.insertMany([{
        startTime: Date.now(),
        state: 'WAITING',
        reason,
        customer,
        orderCode,
        delivery,
        imgFromCus,
        imgFromWebHref,
        imgRefund,
        reasonType,
      }]);
      return userFind;
    } catch (error) {
      return false;
    }
  }
  /**
   * 编辑 findByIdAndUpdate
   */
  public async updateAftermarket(updateObj: AftermarketType) {
    const { ctx } = this;
    try {
      const {
        state = 'WAITING', /** 处理状态 */
        delivery, /** 售后配送员*/
        imgRefund, /** 售后退款截图*/
        reason,
        imgFromWebHref,
        imgFromCus,
        _id,
      } = updateObj;
      const updateData = state ? { state, endTime: Date.now() } : {
        delivery,
        reason,
        imgRefund,
        imgFromCus,
        imgFromWebHref,
      };
      compactObj(updateData);
      const userFind = await ctx.model.Aftermarket.findByIdAndUpdate(
        {
          _id,
        },
        {
          ...updateData,
        },
      );
      const userFind0 = userFind?.[0] ?? {};
      return !!userFind0;
    } catch (error) {
      return false;
    }
  }

  /**
   * 删除
   */
  public async deleteAftermarket(id?: string) {
    const { ctx } = this;
    try {
      if (!id) {
        return false;
      }
      const userHad = await ctx.model.Aftermarket.deleteOne({
        _id: id,
      });
      return (userHad?.ok ?? 0) > 0;
    } catch (error) {
      return false;
    }
  }
  public async searchAftermarket(searchParam: {
    limit?: number;
    page?: number;
    reasonType?: AftermarketReason,
    customer?: string
    state?: string
    reason?: string
    id?: string
  }) {
    const { limit = 9999, page = 1, reasonType, customer, id, state, reason } = searchParam;
    const { ctx } = this;

    const limitNumber = Number(limit) || 9999;
    const pageNumber = Number(page) || 1;

    try {
      const search = id ? { _id: id } : {
        reasonType: changeSpecialCharacter(reasonType),
        customer: changeSpecialCharacter(customer),
        state: changeSpecialCharacter(state),
        reason: changeSpecialCharacter(reason),
      };
      compactObj(search);
      const data: AftermarketType[] = await ctx.model.Aftermarket.find(search)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);
      const outData: AftermarketDetailType[] = [];

      await Promise.all(data.map(async item => {
        const afterNow = item;

        const customerNow: undefined | CustomerType[] = await (afterNow?.customer ? ctx.model.Customer.find({ code: changeSpecialCharacter(afterNow?.customer) }) : undefined);
        const diliverNow: undefined | DepartmentType[] = await (afterNow?.delivery ? ctx.model.Department.find({ code: changeSpecialCharacter(afterNow?.delivery) }) : undefined);
        const handlerNow: undefined | UserType[] = await (afterNow?.handler ? ctx.model.User.find({ _id: changeSpecialCharacter(afterNow?.handler) }) : undefined);

        const imageSrc = item.imgFromCus ? await ctx.service.utils.getCloundImg(item.imgFromCus || '') : undefined;
        const imageBackSrc = item.imgRefund ? await ctx.service.utils.getCloundImg(item.imgRefund || '') : undefined;

        outData.push({
          _id: item._id,
          startTime: item.startTime,
          customer: {
            name: customerNow?.[0]?.name,
            code: customerNow?.[0]?.code,
          },
          endTime: item.endTime,
          state: item.state, /** 处理状态 */
          reason: item.reason, /** 售后原因 */
          orderCode: item.orderCode, /** 订单编号 */
          handler: {
            userName: handlerNow?.[0]?.userName,
          }, /** 处理人*/
          delivery: {
            code: diliverNow?.[0]?.code,
            deName: diliverNow?.[0]?.deName,
          }, /** 售后配送员*/
          imgFromCus: imageSrc, /** 售后截图*/
          imgFromWebHref: item.imgFromWebHref, /** 使用超链接*/
          imgRefund: imageBackSrc, /** 售后退款截图*/
          reasonType: item.reasonType,
        });

      }));
      const total = await ctx.model.Aftermarket.count(search);
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
  /** 修改图片详情或者删除前，先删文件 */
  public async beforeNeedDeletedImg(queriesObj: AftermarketType, key: keyof AftermarketType) {
    const { ctx } = this;
    try {
      const data: AftermarketType[] = await ctx.model.Aftermarket.find(queriesObj);
      // 删除图片
      const imageSrc = data?.[0]?.[key];
      if (imageSrc) {
        await ctx.service.utils.deleteFile(imageSrc);
      }
      return true;
    } catch (e) {
      return false;
    }
  }
}
