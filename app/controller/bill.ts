import { Controller } from 'egg';
import { BillType, CustomerType, DepartmentType } from '../commonJs/type';
import path = require('path');
import { format } from 'date-fns';
import { changeSpecialCharacter } from '../commonJs';

// eslint-disable-next-line array-bracket-spacing
export default class BillController extends Controller {
  public async importBill() {
    const { ctx } = this;
    const fileOut: any[] = await ctx.service.uploadCustum.fileTurnToworsheet();

    try {
      if (fileOut.length > 0) {
        // 对比数据
        const filnalArray: Array<BillType> =
          (await ctx.service.baseBillOperate.importToDB(
            JSON.parse(fileOut[0])?.['导出数据'],
          )) || [];
        const filnalArrayLen = filnalArray.length;
        for (let i = 0; i < filnalArrayLen; i++) {
          const itemNow = filnalArray[i];
          if (itemNow?.orderCode) {
            const findOneIf = await ctx.model.Bill.find({
              orderCode: changeSpecialCharacter(itemNow.orderCode),
            });
            if (findOneIf.length > 0) {
              await ctx.model.Bill.findOneAndUpdate(
                { orderCode: changeSpecialCharacter(itemNow.orderCode) },
                { ...itemNow },
              );
            } else {
              await ctx.service.baseBillOperate.insertBill({
                ...itemNow,
              });
            }
          }
        }
        for (let i = 0; i < filnalArrayLen; i++) {
          const itemFinal = filnalArray[i];
          if (itemFinal?.customer) {
            await ctx.service.baseCustomerOperate.findCustomerAndUpdateOweTotal(itemFinal.customer);
          }
        }

        ctx.body = { error: false };
      } else {
        ctx.body = { error: true };
      }
    } catch (e) {
      console.log('======>>>>>>>importBill', e);
      ctx.body = { error: true };
    }
  }
  /** 覆盖式导入 */
  public async importCoverBill() {
    const { ctx } = this;
    const fileOut: any[] = await ctx.service.uploadCustum.fileTurnToworsheet();
    try {
      if (fileOut.length > 0) {
        // 对比数据
        const filnalArray: Array<BillType> =
          (await ctx.service.baseBillOperate.importToDB(
            JSON.parse(fileOut[0])?.['导出数据'],
          )) || [];
        const filnalArrayLen = filnalArray.length;
        // 清0
        const hasTotal = await ctx.model.Customer.find({ oweTotal: { $gte: 0 } });
        hasTotal.forEach(async v => {
          await ctx.model.Customer.findOneAndUpdate({ code: v.code }, { oweTotal: 0 });
        });
        // 删除远程文件
        const hasImage = await ctx.model.Bill.find({ img: { $regex: new RegExp(/\./), $options: 'i' } });
        hasImage.forEach(async v => {
          await ctx.service.utils.deleteFile(v?.img);
        });
        await ctx.model.Bill.deleteMany({});

        for (let i = 0; i < filnalArrayLen; i++) {
          const itemNow = filnalArray[i];
          if (itemNow?.orderCode) {
            await ctx.service.baseBillOperate.insertBill({
              ...itemNow,
            });
          }
        }
        for (let i = 0; i < filnalArrayLen; i++) {
          const itemFinal = filnalArray[i];
          if (itemFinal?.customer) {
            await ctx.service.baseCustomerOperate.findCustomerAndUpdateOweTotal(itemFinal.customer);
          }
        }
        ctx.body = { error: false };
      } else {
        ctx.body = { error: true };
      }
    } catch (e) {
      console.log('======>>>>eimportCoverBill', e);
      ctx.body = { error: true };
    }

  }
  public async addBill() {
    const { ctx } = this;
    const data: BillType = ctx.request.body;
    try {

      const result = await ctx.service.baseBillOperate.insertBill({ ...data });
      ctx.body = result || { error: true };

    } catch (e) {
      console.log('addBill', e);
      ctx.body = { error: true };
    }
  }
  public async updateBill() {
    const { ctx } = this;
    const { id } = ctx.request.body;

    try {

      const data: BillType = await ctx.model.Bill.findById(id);
      // 删除图片
      await ctx.service.utils.deleteFile(data?.img);
      await ctx.service.baseBillOperate.beforeNeedDeletedImg({ _id: changeSpecialCharacter(id) });
      // 删除该数据
      await ctx.service.baseBillOperate.deleteBill(id);
      // 重新计算该客户的欠单总金额
      await ctx.service.baseCustomerOperate.findCustomerAndUpdateOweTotal(data.customer);

      await ctx.service.baseRecordoOperate.addLogOfLogInPerson({ item: ',为订单：' + data?.orderCode });

      ctx.body = { error: false };
    } catch (e) {
      console.log('updateBill', e);
      ctx.body = { error: true };
    }
  }
  public async deleteBill() {
    const { ctx } = this;
    const { id } = ctx.request.query;
    try {
      await ctx.service.baseBillOperate.beforeNeedDeletedImg({ _id: changeSpecialCharacter(id) });
      const result = await ctx.service.baseBillOperate.deleteBill(id);
      ctx.body = result || { error: true };
    } catch (e) {
      console.log('deleteBill', e);
      ctx.body = { error: true };
    }
  }
  public async findBill() {
    const { ctx } = this;
    const search: any = ctx.request.body;
    try {
      const result = await ctx.service.baseBillOperate.searchBill(search);
      ctx.body = result?.success && result;
    } catch (e) {
      ctx.body = { error: true };
    }
  }
  public async billImg() {
    const { ctx } = this;
    const { orderCode } = ctx.request.query;

    if (!orderCode) {
      ctx.body = { error: true };
      return false;
    }
    try {
      await ctx.service.baseBillOperate.beforeNeedDeletedImg({ orderCode: changeSpecialCharacter(orderCode) });
      const data = await ctx.service.utils.uploadsGit();
      if (data && data?.key) {

        await ctx.model.Bill.findOneAndUpdate({ orderCode }, { img: data?.key, imgUploader: ctx.session.id });

        await ctx.service.baseRecordoOperate.addLogOfLogInPerson({ item: ',为订单：' + orderCode });
        ctx.body = { error: false };
      } else {
        ctx.body = { error: true };
      }

    } catch (e) {
      console.error('=====>>>>>>billImg error', e);
      ctx.body = { error: true };
    }
  }
  public async downloadAllBill() {
    const { ctx } = this;

    const fileOut: any[] = await ctx.service.uploadCustum.localFileTurnToworsheet({ filepath: path.join('app', 'public', 'baseData', '全部欠单.xlsx') });

    const dataFromExcel: Array<any> = JSON.parse(fileOut[0])?.['库存状况表'];
    const dataWithIndex = await ctx.service.sortSxExcel.arrIndex(
      dataFromExcel?.[3],
    );
    const lengthEx = dataFromExcel[3].length;
    try {
      // 单据编号	过账时间	客户名称	※业务员※	配送员=部门	优惠后金额	单据类型
      // 	客户编号	经手人编号	部门编号	 图片详情

      const billAll: BillType[] = await ctx.model.Bill.find();
      const billAllLen = billAll.length;

      for (let i = 1; i < billAllLen; i++) {
        const thisFindP = billAll[i];
        const customerCode = thisFindP?.customer;
        const managerCode = thisFindP?.manager;
        const deliveryCode = thisFindP?.delivery;
        const customer: Array<CustomerType> = await ctx.model.Customer.find({ code: changeSpecialCharacter(customerCode as any) });
        const manager: Array<DepartmentType> = await ctx.model.Department.find({ code: changeSpecialCharacter(managerCode as any), label: 'DISTRICT' });
        const delivery: Array<DepartmentType> = await ctx.model.Department.find({ code: changeSpecialCharacter(deliveryCode as any), label: 'DEPARTENT' });

        if (thisFindP) {
          const temp = Array(lengthEx).fill('');
          temp[dataWithIndex['单据编号']] = thisFindP?.orderCode;
          temp[dataWithIndex['过账时间']] = thisFindP?.startTime && format(new Date(thisFindP?.startTime), 'yyyy-MM-dd HH:mm:ss');
          temp[dataWithIndex['客户名称']] = customer?.[0]?.name;
          temp[dataWithIndex['※业务员※']] = manager?.[0]?.deName;
          temp[dataWithIndex['配送员=部门']] = delivery?.[0]?.deName;
          temp[dataWithIndex['优惠后金额']] = thisFindP?.amount;
          temp[dataWithIndex['单据类型']] = '销售单';
          temp[dataWithIndex['客户编号']] = customerCode;
          temp[dataWithIndex['经手人编号']] = managerCode;
          temp[dataWithIndex['部门编号']] = deliveryCode;
          temp[dataWithIndex['图片详情']] = thisFindP?.img;
          // eslint-disable-next-line array-bracket-spacing
          dataFromExcel.push([...temp]);
        }
      }
      const streamFile = await ctx.service.uploadCustum.makeTempCustom(dataFromExcel, '导出数据');
      ctx.set('Content-Type', 'application/octet-stream');
      ctx.attachment('全部欠单.xlsx');
      ctx.body = streamFile;
    } catch (e) {
      ctx.body = { error: true };
    }
  }
}
