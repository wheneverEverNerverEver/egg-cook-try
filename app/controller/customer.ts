import { Controller } from 'egg';
import { CustomerType } from '../commonJs/type';
import path = require('path');
import fs = require('fs');
import { changeSpecialCharacter, compactObj, getBackReallyAfterAddNumber } from '../commonJs';

function gotTime() {
  const myDate = new Date(); // 实例一个时间对象；
  const hour = myDate.getHours(); // 获取系统时，
  const minutes = myDate.getMinutes(); // 分
  const sec = myDate.getSeconds(); // 秒
  return `${hour}_${minutes}_${sec}`;
}

// eslint-disable-next-line array-bracket-spacing
const usedClass = ['DEPARTENT', 'DISTRICT', 'CLASS', 'STAFF', 'BELONG', 'WAREHOUSE'];

const findThisOne = (arr: Array<string>, finFG: string) => {
  const arrLen = arr?.length;
  if (!arrLen || arrLen < 1) {
    return false;
  }
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === finFG) {
      return true;
    }
  }
  return false;
};

export default class CustomerController extends Controller {
  public async importCustomer() {
    const { ctx } = this;
    const fileOut: any[] = await ctx.service.uploadCustum.fileTurnToworsheet();
    const { labelType }: Record<string, string> = ctx.request.query;

    if (!labelType || findThisOne(usedClass, labelType)) {
      ctx.body = 'false';
      return false;
    }

    try {
      if (fileOut.length > 0) {
        // 对比数据
        const filnalArray: Array<CustomerType> =
          (await ctx.service.baseCustomerOperate.importToDB(
            JSON.parse(fileOut[0])?.['导出数据'],
          )) || [];
        const filnalArrayLen = filnalArray.length;
        for (let i = 0; i < filnalArrayLen; i++) {
          const itemNow = filnalArray[i];
          if (itemNow?.code) {
            const findOneIf = await ctx.model.Customer.find({
              code: changeSpecialCharacter(itemNow.code),
            });
            if (findOneIf.length > 0) {
              if (itemNow?.status) {
                await ctx.model.Customer.deleteOne({ code: itemNow.code });
              } else {
                await ctx.model.Customer.findOneAndUpdate(
                  { code: itemNow.code },
                  { ...itemNow, label: labelType, updateTime: Date.now() },
                );
              }

            } else {
              if (!itemNow?.status) {
                await ctx.service.baseCustomerOperate.insertCustomer({
                  ...itemNow, label: labelType, deadline: 3, oweTotal: 0, updateTime: Date.now(),
                });
              }

            }
          }
        }

        ctx.body = { error: false };
      } else {
        ctx.body = { error: true };
      }
    } catch (e) {
      console.log('======>>>>>>>importCustomer', e);
      ctx.body = { error: true };
    }
  }
  public async importIndeedCustomer() {
    const { ctx } = this;
    const fileOut: any[] = await ctx.service.uploadCustum.fileTurnToworsheet();
    const { labelType }: Record<string, string> = ctx.request.query;

    if (!labelType || findThisOne(usedClass, labelType)) {
      ctx.body = 'false';
      return false;
    }

    try {
      if (fileOut.length > 0) {
        // 对比数据
        const filnalArray: Array<CustomerType> =
          (await ctx.service.baseCustomerOperate.importToDB(
            JSON.parse(fileOut[0])?.['导出数据'],
          )) || [];

        await ctx.model.Customer.deleteMany({});

        console.log('=======>>>>>>filnalArrayLen801', filnalArray[1656]);

        await Promise.all(filnalArray.map(async itemNow => {
          if (itemNow?.code) {
            const fiadAllBill = await ctx.service.baseBillOperate.searchBill({ customer: itemNow?.code as any });
            let gotTotalValue = 0;
            const customBill = fiadAllBill?.data || [];
            for (let i = 0; i < customBill.length; i++) {
              gotTotalValue = getBackReallyAfterAddNumber(customBill[i].amount, gotTotalValue);
            }
            await ctx.service.baseCustomerOperate.insertCustomer({
              ...itemNow, label: labelType, deadline: 7, updateTime: Date.now(),
              oweTotal: gotTotalValue || 0,
            });
          }

        }));


        ctx.body = { error: false };
      } else {
        ctx.body = { error: true };
      }
    } catch (e) {
      ctx.body = { error: true };
    }
  }
  public async addCustomer() {
    const { ctx } = this;
    const data: CustomerType = ctx.request.body;
    try {

      const result = await ctx.service.baseCustomerOperate.insertCustomer({ ...data });
      ctx.body = result || { error: true };

    } catch (e) {
      console.log('addCustomer', e);
      ctx.body = { error: true };
    }
  }
  public async updateCustomer() {
    const { ctx } = this;
    const { _id, deadline, trUsed } = ctx.request.body;

    try {
      const updateObj = {
        trUsed: trUsed && Number(trUsed),
        deadline: deadline && Number(deadline),
      };

      compactObj(updateObj);
      const result = await ctx.service.baseCustomerOperate.updateCustomer(_id, {
        ...updateObj,
      });
      ctx.body = result || { error: true };
    } catch (e) {
      console.log('updateCustomer', e);
      ctx.body = { error: true };
    }
  }
  public async deleteCustomer() {
    const { ctx } = this;
    const { id } = ctx.request.query;
    try {
      const result = await ctx.service.baseCustomerOperate.deleteCustomer(id);
      ctx.body = result || { error: true };
    } catch (e) {
      console.log('deleteCustomer', e);
      ctx.body = { error: true };
    }
  }
  public async findCustomer() {
    const { ctx } = this;
    const search: any = ctx.request.query;
    try {
      const result = await ctx.service.baseCustomerOperate.searchCustomer(search);
      ctx.body = result?.success && result;
    } catch (e) {
      ctx.body = { error: true };
    }
  }
  public async transformYZSVC() {
    const { ctx } = this;
    const query: any = ctx.request.query;
    const fileOut: any[] = await ctx.service.uploadCustum.fileTurnToworsheet();

    try {
      if (fileOut.length > 0) {
        // 对比数据，将码互相转换
        const filnalJson: Record<any, any> =
          (await ctx.service.baseCustomerOperate.changeCustomerEach(
            JSON.parse(fileOut[0])?.['导出数据'],
            query?.belong,
          )) || {};

        // const streamFile = await ctx.service.uploadCustum.makeTempCustom(filnalJson.outComeExcel, '有赞客户导入模板');
        // ctx.set('Content-Type', 'application/octet-stream');
        // ctx.attachment('转换后客户.csv');
        // ctx.body = streamFile;
        const fileName = `${query?.belong}客户${gotTime()}`;
        await ctx.service.uploadCustum.makeBook(
          filnalJson.outComeExcel || [],
          '有赞客户导入模板',
          fileName,
          true,
        );

        const filePath = `/public/download/exportConversion/${fileName}.csv`;
        ctx.body = {
          fileName: filePath,
          errorArr: filnalJson.error,
        };
        setTimeout(() => {
          fs.unlink(path.join(__dirname, `./../${filePath}`), e => {
            console.log('=====>>>>e unlink', e);
          });
        }, 11 * 1000);
      } else {
        ctx.body = { error: true };
      }
    } catch (e) {
      console.error('=====>>>>transformYZSVC', e);
      ctx.body = { error: true };
    }

  }
}
