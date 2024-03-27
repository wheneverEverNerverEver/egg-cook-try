/* eslint-disable array-bracket-spacing */
import { Service } from 'egg';
import { compactObj, findIndex, getValue, getBackReallyNumber, changeSpecialCharacter } from '../commonJs';
import { BillType, CustomerType, CustomerTypeName, DepartmentType } from '../commonJs/type';
import * as mubanYZCJson from './../public/baseData/youzanCustomerIn.json';
import path = require('path');
import { uniqBy } from 'lodash';

/**
 * 客户的基本增删改查
 */
export default class baseCustomerOperate extends Service {
  /**
 * 处理数据
 * @param guanjiaArr 管家婆客户导入
 */
  public async changeCustomerEach(guanjiaArr: Array<any>, belong?: string) {
    const { ctx } = this;
    const arr1Length = guanjiaArr.length;
    if (arr1Length < 2) {
      return false;
    }
    try {

      let youzanArr: Array<any> = (mubanYZCJson as unknown as { data: Array<any> })?.data;
      if (!youzanArr) {
        const baseCYZ = await ctx.service.uploadCustum.localFileTurnToworsheet({ filepath: path.join(__dirname, './../public/baseData/有赞客户导入模板.csv') });
        const parseBaseYZ = JSON.parse(baseCYZ[0]);
        youzanArr = parseBaseYZ?.['有赞导入模板'] || parseBaseYZ?.['Sheet1'];
      }
      /**
       * 有赞模板
       * 手机号（必填）	姓名（最多32个字）	性别（男/女）	生日（比如：1989/08/08 或 1989-08-08）	微信（最多16个字符）	备注	省	市	区/县	详细地址	积分（限整数）	储值余额（单位：元，精确小数点后两位）	储值赠送金（单位：元，精确小数点后两位）	标签（注：多个用、隔开，标签不存在则新建标签。如：标签A、标签B）	会员等级值（VIP+等级值。如：VIP1）	成长值（限整数）	[销售员]手机号（11位手机号）	归属店铺
       *
       * 管家婆导出
       * 行号	客户编号	客户名称	※业务员※=地区 单位地址	配送员=经手人	客户电话	适用价格	状态
       *
       * 开桔橘=======鹏和农贸生鲜======鹏和
       * 鹏和餐饮=======食享客户=========食享
       */


      const guanjiaArr0 = guanjiaArr[3];
      const youzanArr0 = youzanArr[8];
      const youzanArr0Len = youzanArr0.length;

      const kehuIndexGJ = findIndex(guanjiaArr0, '客户编号');
      const kehuNameGJ = findIndex(guanjiaArr0, '客户名称');
      const kehuPhoneGJ = findIndex(guanjiaArr0, '客户电话');
      const kehuAdressGJ = findIndex(guanjiaArr0, '单位地址');
      const zhuangtaiGJ = findIndex(guanjiaArr0, '状态');

      const kehuPhoneYZ = findIndex(youzanArr0, '手机号（必填）');
      const kehuNameYZ = findIndex(youzanArr0, '姓名（最多32个字）');
      const kehuAddressYZ = findIndex(youzanArr0, '详细地址');
      const kehuBelongYZ = findIndex(youzanArr0, '归属店铺');

      const idMapJson: Array<any> = [...youzanArr];
      const errorArr: Array<any> = [];

      const noSame = {};


      for (let i = 1; i < arr1Length; i++) {
        const nowItem = guanjiaArr[i];
        const tempArr = (new Array(youzanArr0Len)).fill('');

        if (!(nowItem?.[zhuangtaiGJ]) && nowItem) {
          const phoneTemp = nowItem?.[kehuPhoneGJ] || '';
          const codeTemp = nowItem?.[kehuIndexGJ];
          const nameTemp = nowItem?.[kehuNameGJ];
          const tempName = `${codeTemp || ''}@${nameTemp || ''}`;

          if (phoneTemp && phoneTemp.length === 11) {
            const ifHadSamePhone = await ctx.model.Customer.find({ phone: changeSpecialCharacter(phoneTemp + '') }).sort('code');
            const ifHadSamePhonelen = ifHadSamePhone?.length;
            tempArr[kehuPhoneYZ] = phoneTemp;
            tempArr[kehuNameYZ] = tempName.substring(0, 32);
            tempArr[kehuAddressYZ] = nowItem?.[kehuAdressGJ] || '';
            tempArr[kehuBelongYZ] = belong || '';
            if (ifHadSamePhonelen === 1) {
              idMapJson.push([...tempArr]);
            } else {
              Array.isArray(ifHadSamePhone) && ifHadSamePhone.forEach((v, index) => {
                // 重复客户取后一个
                if (index === ifHadSamePhonelen - 1 && ifHadSamePhonelen > 1 && !noSame?.[phoneTemp]) {
                  noSame[phoneTemp] = true;
                  idMapJson.push([...tempArr]);
                }
                errorArr.push({ code: v.code, name: v.name, phone: phoneTemp });
              });
            }
          } else if (codeTemp) {
            errorArr.push({ code: codeTemp, name: nameTemp, phone: phoneTemp });
          }
        }


      }
      return {
        outComeExcel: idMapJson,
        error: uniqBy(errorArr, 'code').sort((a, b) => b?.phone - a?.phone),
      };
    } catch (e) {
      console.log('====>>>error changeCustomerEach ', e);
    }
  }
  /**
   * 新增
   */
  public async insertCustomer(managerObj: CustomerType) {
    const { ctx } = this;
    try {
      const managerFind = await ctx.model.Customer.insertMany([{ ...managerObj, updateTime: Date.now() }]);
      return managerFind;
    } catch (error) {
      console.log('=============insertCustomer,,,error', error);
      return false;
    }
  }
  /**
   * 编辑 findByIdAndUpdate
   */
  public async updateCustomer(id: string, updateObj: Record<string, any>) {
    const { ctx } = this;
    try {
      compactObj(updateObj);
      const managerFind = await ctx.model.Customer.findByIdAndUpdate(
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
  public async deleteCustomer(id: string) {
    const { ctx } = this;
    try {
      await ctx.model.Customer.deleteOne({
        _id: id,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
  public async searchCustomer(search: CustomerType & {
    limit?: string,
    page?: string,
    name?: string
    sort?: string
  }) {
    const { limit = 99, page = 1, name, code, district, label, deadline, manager, sort, phone } = search;
    const { ctx } = this;
    const searchParam = {
      name: name && { $regex: new RegExp(changeSpecialCharacter(name)), $options: 'i' },
      code: code && { $regex: new RegExp(changeSpecialCharacter(code)), $options: 'i' },
      phone: phone && { $regex: new RegExp(changeSpecialCharacter(phone)), $options: 'i' },
      manager: manager && changeSpecialCharacter(manager),
      district: changeSpecialCharacter(district),
      label: changeSpecialCharacter(label),
      deadline: deadline && Number(deadline),
    };

    compactObj(searchParam);
    const limitNumber = Number(limit) || 99;
    const pageNumber = Number(page) || 1;
    try {
      /** 找到统计字段 */

      const data: Array<CustomerType> = await ctx.model.Customer.find({ ...searchParam })
        .sort(!sort ? '-oweTotal' : sort)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

      const total = await ctx.model.Customer.where({ ...searchParam }).count();

      const dataFinal: Array<CustomerTypeName> = [];
      await Promise.all(data.map(async v => {
        const labelNo: DepartmentType = await ctx.model.Department.findOne({ code: v?.label, label: 'CLASS' });
        const districtNo: DepartmentType = await ctx.model.Department.findOne({ code: v?.district, label: 'DISTRICT' });
        const staffNo: DepartmentType = await ctx.model.Department.findOne({ code: v?.manager, label: 'STAFF' });

        dataFinal.push({
          _id: v?._id,
          code: v?.code,
          name: v?.name,
          updateTime: v?.updateTime,
          deadline: v?.deadline,
          label: {
            code: labelNo?.code,
            deName: labelNo?.deName,
          },
          district: {
            code: districtNo?.code,
            deName: districtNo?.deName,
          },
          manager: {
            code: staffNo?.code,
            deName: staffNo?.deName,
          },
          oweTotal: v?.oweTotal,
        });
      }));
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
    const { ctx } = this;
    if (fileDataLength < 4) {
      return [];
    }
    const arrData0 = arrData[3];
    // 找到对应的下标
    const codeIdSx = findIndex(arrData0, '客户编号');
    const deName = findIndex(arrData0, '客户名称');
    const districtIndex = findIndex(arrData0, '配送路线');
    const managerIndex = findIndex(arrData0, '业务员');
    const zhuangtaiIndex = findIndex(arrData0, '状态');
    const phoneIndex = findIndex(arrData0, '客户电话');
    console.log('=====>>>>>managerIndex', managerIndex);


    const dataInner: Array<CustomerType> = [];

    await Promise.all(arrData.map(async (arrDataKK, index) => {
      if (index > 3) {
        const nowCode = arrDataKK[codeIdSx];
        const nowname = arrDataKK[deName];
        const nowdistrict = arrDataKK[districtIndex];
        const managerNow = arrDataKK[managerIndex];


        const districtDate: DepartmentType = await ctx.model.Department.findOne({ deName: nowdistrict, label: 'DISTRICT' });
        const managerData: DepartmentType = await ctx.model.Department.findOne({ deName: managerNow, label: 'STAFF' });

        const arrIn: CustomerType = {
          code: nowCode + '',
          name: nowname,
          updateTime: Date.now(),
          district: districtDate?.code,
          label: '',
          manager: managerData?.code,
          status: arrDataKK[zhuangtaiIndex],
          phone: arrDataKK[phoneIndex],
        };

        dataInner.push({
          ...arrIn!,
        });
      }
    }));

    return dataInner;
  }
  public async findCustomerAndUpdateOweTotal(customerCode) {
    const { ctx } = this;
    try {
      const allThisCustomerBill: BillType[] = await ctx.model.Bill.find({ customer: changeSpecialCharacter(customerCode) });
      let total = 0;
      allThisCustomerBill.forEach(v => {
        total = getValue((Number(v?.amount) || 0)) + total;
      });
      const totalFinal = getBackReallyNumber(total);
      await ctx.model.Customer.findOneAndUpdate({ code: customerCode }, { oweTotal: totalFinal });
    } catch (e) {
      console.error('findCustomerAndUpdateOweTotal', e);
    }
  }
}
