/* eslint-disable object-shorthand */
/* eslint-disable array-bracket-spacing */
import { Service } from 'egg';
import { changeSpecialCharacter, compactObj, findIndex, sortParams } from '../commonJs';
import { BillType, BillTypeCode, CustomerType, DepartmentType, StatusBillWord, UserType } from '../commonJs/type';
import { startOfDay, endOfDay } from 'date-fns';


const timeLadder = {
  OWE: 60 * 1000 * 60 * 24 * 3,
  SERIOUS_DELAY: 60 * 1000 * 60 * 24 * 7,
};
//   where('age').gt(17).lt(66).
const timeSearch = () => {
  const dateNow = Date.now();
  const thereDay = dateNow - timeLadder.OWE;// 三天前
  const sevenDay = dateNow - timeLadder.SERIOUS_DELAY;// 七天前
  // 超过7天，即为严重
  // '3_OWE' | '4_PAY_OFF' | '1_SERIOUS_DELAY' | '2_HIGH_DELAY'
  return {
    '3_OWE': { $gt: thereDay },
    '2_HIGH_DELAY': { $gte: sevenDay, $lte: thereDay },
    '1_SERIOUS_DELAY': { $lt: thereDay },
  };
};

const timeBetween = (dateNow: number, endTime?: number | string, startTime?: number | string): StatusBillWord => {
  if (!endTime) {
    const nowTime = dateNow;
    const spaceTime = nowTime - (new Date(startTime!)).getTime();
    // '3_OWE' | '1_SERIOUS_DELAY' | '2_HIGH_DELAY'
    if (spaceTime <= timeLadder.OWE) {
      return '3_OWE';
    }
    if (spaceTime > timeLadder.OWE && spaceTime < timeLadder.SERIOUS_DELAY) {
      return '2_HIGH_DELAY';
    }
    return '1_SERIOUS_DELAY';
  }
  return '3_OWE';
};

/**
 * 客户的基本增删改查
 */
export default class baseBillOperate extends Service {
  /**
   * 新增
   */
  public async insertBill(managerObj: BillType) {
    const { ctx } = this;
    try {
      const managerFind = await ctx.model.Bill.insertMany([{ ...managerObj, updateTime: Date.now() }]);
      return managerFind;
    } catch (error) {
      console.log('=============insertBill,,,error', error);
      return false;
    }
  }
  /**
   * 编辑 findByIdAndUpdate
   */
  public async updateBill(id: string, updateObj: Record<string, any>) {
    const { ctx } = this;
    try {
      compactObj(updateObj);
      const managerFind = await ctx.model.Bill.findByIdAndUpdate(
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
  public async deleteBill(id: string) {
    const { ctx } = this;
    try {
      await ctx.model.Bill.deleteOne({
        _id: id,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
  // 查询账单
  public async searchBill(search: BillType & {
    limit?: string,
    page?: string,
    accounting?: string,
    sort?: Partial<Record<keyof BillType, 'ascend' | 'descend'>>
  }) {
    const { limit = 99, page = 1, orderCode, state, amount, manager, delivery, customer, startTimeRange, accounting, sort } = search;

    const { ctx } = this;
    let startTimeFi;
    if (startTimeRange?.[0] && startTimeRange?.[1]) {
      startTimeFi = {
        $gte: startOfDay(new Date(startTimeRange[0])).getTime(),
        $lte: endOfDay(new Date(startTimeRange[1])).getTime(),
      };
    }
    /**
     * manager是all和other的时候，特殊处理
     */
    const searchParam: any = {
      name: orderCode && { $regex: new RegExp(changeSpecialCharacter(orderCode)), $options: 'i' },
      startTime: startTimeFi ? startTimeFi : state && (timeSearch())[state],
      amount: amount && changeSpecialCharacter(amount),
      manager: manager && changeSpecialCharacter(manager),
      delivery: delivery && changeSpecialCharacter(delivery),
      customer: customer && changeSpecialCharacter(customer),
    };

    compactObj(searchParam);
    const limitNumber = Number(limit) || 99;
    const pageNumber = Number(page) || 1;
    if (accounting) {
      if (accounting === 'other') {
        const dataOther: DepartmentType[] = await ctx.model.Department.find({ label: 'DISTRICT', showInMenu: { $nin: [true] } });
        const dataFinal = dataOther?.map(v => v.code);
        if (dataFinal.length > 0) {
          (searchParam as any).manager = {
            $in: dataFinal,
          };
        } else {
          delete searchParam.manager;
        }
      } else if (accounting !== 'all') {
        (searchParam as any).manager = accounting;
      }
    }


    try {

      const sortData = sortParams(sort);
      const data: Array<BillTypeCode> = await ctx.model.Bill.find({ ...searchParam })
        .sort(sort ? {
          ...sortData,
        } : { endTime: 1, startTime: 1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

      const total = await ctx.model.Bill.where({ ...searchParam }).count();
      const dateNow = Date.now();

      const dataFinal: Array<BillType> = [];
      for (let i = 0; i < data.length; i++) {
        const v = data[i];
        const customerCode = v?.customer;
        const managerCode = v?.manager;
        const deliveryCode = v?.delivery;

        const customer: Array<CustomerType> = await ctx.model.Customer.find({ code: changeSpecialCharacter(customerCode) });
        const manager: Array<DepartmentType> = await ctx.model.Department.find({ code: changeSpecialCharacter(managerCode), label: 'DISTRICT' });
        const delivery: Array<DepartmentType> = await ctx.model.Department.find({ code: changeSpecialCharacter(deliveryCode), label: 'DEPARTENT' });
        const gotImg = v?.img ? await ctx.service.utils.getCloundImg(v.img) : '';
        const stateNow = timeBetween(dateNow, v?.endTime, v?.startTime);


        const imgUploader: UserType = v.imgUploader ? await ctx.model.User.findById(v.imgUploader) : {};

        dataFinal.push({
          startTime: v.startTime,
          customer: {
            code: customer?.[0]?.code,
            name: customer?.[0]?.name,
          },
          endTime: v?.endTime,
          state: stateNow as StatusBillWord, /** 订单状态 */
          amount: v?.amount, /** 金额 */
          orderCode: v?.orderCode,
          manager: {
            code: manager?.[0]?.code,
            deName: manager?.[0]?.deName,
          }, /** 经手人*/
          delivery: {
            code: delivery?.[0]?.code,
            deName: delivery?.[0]?.deName,
          }, /** 配送人*/
          img: gotImg,
          imgUploader: imgUploader?.userName,
          _id: v?._id,
        });

      }

      return {
        data: dataFinal,
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
  /** 导入数据 */
  public async importToDB(arrData: Array<any>) {
    const fileDataLength = arrData.length;

    if (fileDataLength < 4) {
      return [];
    }
    const arrData0 = arrData[3];
    // 找到对应的下标
    const customerCode = findIndex(arrData0, '客户编号');
    const startTimeC = findIndex(arrData0, '过账时间');
    const orderCode = findIndex(arrData0, '单据编号');
    const managerCode = findIndex(arrData0, '经手人编号');
    const departCode = findIndex(arrData0, '部门编号');
    const amountCode = findIndex(arrData0, '优惠后金额');
    const imgCode = findIndex(arrData0, '图片详情');

    const dataInner: Array<BillType> = [];

    for (let k = 3; k < fileDataLength; k++) {
      const customerCodeNow = arrData[k][customerCode];
      const startTimeCNow = arrData[k][startTimeC];
      const orderCodeNow = arrData[k][orderCode];
      const managerCodeNow = arrData[k][managerCode];
      const departCodeNow = arrData[k][departCode];
      const amountCodeNow = arrData[k][amountCode];
      const imgCodeNow = imgCode > -1 ? arrData[k][imgCode] : '';


      const arrIn: BillType = {
        startTime: (new Date(startTimeCNow)).getTime(),
        customer: customerCodeNow as any,
        endTime: undefined,
        state: undefined, /** 订单状态 */
        amount: amountCodeNow || 0, /** 金额 */
        orderCode: orderCodeNow,
        manager: managerCodeNow as any, /** 经手人*/
        delivery: departCodeNow as any, /** 配送人*/
        img: imgCodeNow,
      };

      dataInner.push({
        ...arrIn!,
      });
    }
    return dataInner;
  }
  /** 修改订单图片详情或者删除订单前，先删文件 */
  public async beforeNeedDeletedImg(queriesObj: BillType) {
    const { ctx } = this;
    try {
      const data: BillType[] = await ctx.model.Bill.find(queriesObj);
      // 删除图片
      const imageSrc = data?.[0]?.img;
      if (imageSrc) {
        await ctx.service.utils.deleteFile(imageSrc);

      }
      return true;
    } catch (e) {
      return false;
    }
  }
}

