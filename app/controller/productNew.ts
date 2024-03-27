/* eslint-disable array-bracket-spacing */
import { Controller } from 'egg';
import path = require('path');
import fs = require('fs');
import { keys } from 'lodash';
import { ProductYzTransform, ProductDetailType, ProductNewType } from '../commonJs/type';


// 获取对象的元素
function getKeyFrist(obj: Record<any, any>) {
  const keysArr = keys(obj);
  if (keysArr) {
    return obj[keysArr[0]];
  }
  return [];

}

export default class ProductNewController extends Controller {

  /** 新增商品*/
  public async addProductNew() {
    const { ctx } = this;
    const data: ProductNewType = ctx.request.body;

    try {
      if (!data) throw Error('参数错误');
      await ctx.service.baseProductNewOperate.insertProductNew({ ...data, updateTime: Date.now() });
      await ctx.service.baseRecordoOperate.addLogOfLogInPerson({ item: '：' + data?.code });
      ctx.body = { error: false };
    } catch (e) {
      console.log('addProductNew', e);
      ctx.body = { error: true };
    }
  }

  /** 删除商品 */
  public async deleteProductNew() {
    const { ctx } = this;
    const data: Record<string, string> = ctx.request.query;

    try {
      await ctx.service.baseProductNewOperate.deleteProductNew(data.id);
      await ctx.service.baseRecordoOperate.addLogOfLogInPerson();
      ctx.body = { error: false };
    } catch (e) {
      ctx.body = { error: true };
    }
  }

  /** 编辑商品*/
  public async updateProductNew() {
    const { ctx } = this;
    const data: Record<string, any> = ctx.request.body;
    const { _id, ...finalRest } = data;
    try {
      const result = await ctx.service.baseProductNewOperate.ProductNewUpdate(_id, {
        ...finalRest,
        updateTime: Date.now(),
      });
      await ctx.service.baseRecordoOperate.addLogOfLogInPerson({ item: '：' + finalRest?.code + finalRest?.gjname });
      ctx.body = result;
    } catch (e) {
      console.log('updateProductNew', e);
      ctx.body = { error: true };
    }
  }

  /** 商品查询 */
  public async findProductNew() {
    const { ctx } = this;
    const search: any = ctx.request.query;
    try {
      const result = await ctx.service.baseProductNewOperate.searchProductNew(search);
      ctx.body = result?.success ? result : false;
    } catch (e) {
      ctx.body = { error: true };
    }
  }
  /** 单条商品查询 */
  public async findProductNewOne() {
    const { ctx } = this;
    const search: any = ctx.request.query;
    try {
      const result = await ctx.service.baseProductNewOperate.findProduct(search);
      ctx.body = result?._id ? result : false;
    } catch (e) {
      ctx.body = { error: true };
    }
  }
  /** 有赞商品总部文件导入 */
  public async importYzProduct() {
    const { ctx } = this;
    const fileOut: any[] = await ctx.service.uploadCustum.fileTurnToworsheet();
    try {
      // eslint-disable-next-line array-bracket-spacing
      if (fileOut.length > 0) {
        // 对比数据
        const filnalArray: Array<any> = (await ctx.service.baseProductNewOperate.importyzToDB(
          JSON.parse(fileOut[0])?.['商品库商品'],
        )) || [];

        await ctx.service.baseProductNewOperate.importProductUpdate(filnalArray, 'youzan');

        ctx.body = { error: false };
      } else {
        ctx.body = { error: true };
      }
    } catch (e) {
      console.error('======>>>>>>importYzProduct error', e);
      ctx.body = { error: true };
    }
  }
  /** 食享商品文件导入 */
  public async importSxProduct() {
    const { ctx } = this;
    const fileOut: any[] = await ctx.service.uploadCustum.fileTurnToworsheet();
    try {
      // eslint-disable-next-line array-bracket-spacing
      if (fileOut.length > 0) {
        // 对比数据
        const filnalArray: Array<any> =
          (await ctx.service.baseProductNewOperate.importsxToDB(
            JSON.parse(fileOut[0])?.['库存状况表'],
          )) || [];

        await ctx.service.baseProductNewOperate.importProductUpdate(filnalArray, 'shixiang');


        ctx.body = { error: false };
      } else {
        ctx.body = { error: true };
      }
    } catch (e) {
      console.error('======>>>>>>importProduct error', e);
      ctx.body = { error: true };
    }
  }
  /** 管家婆商品及价格导入 */
  public async importProductGjPrice() {
    const { ctx } = this;

    const fileOut: any[] = await ctx.service.uploadCustum.fileTurnToworsheet();
    try {
      if (fileOut.length > 0) {
        const filnalArr =
          (await ctx.service.baseProductNewOperate.importgjPriceToDB(
            JSON.parse(fileOut[0])?.['导出数据'],
          )) || [];

        ctx.service.baseProductNewOperate.importProductUpdate(filnalArr as ProductNewType[], 'baseWayGj');

        ctx.body = { error: false };
      } else {
        ctx.body = { error: true };
      }
    } catch (e) {
      console.error('======>>>>>>importProductGjPrice error', e);
      ctx.body = { error: true };
    }
  }
  /** 有赞价格导入 */
  public async importProductyzPrice() {
    const { ctx } = this;
    const { type }: any = ctx.request.query;

    const fileOut: any[] = await ctx.service.uploadCustum.fileTurnToworsheet();
    try {
      if (fileOut.length > 0) {
        const filnalObj = (await ctx.service.baseProductNewOperate.importyzPriceToDB(
          JSON.parse(fileOut[0])?.['网店商品'],
        )) || [];

        await ctx.service.baseProductNewOperate.priceChangeYzAfterImport({ price: filnalObj, type });

        ctx.body = { error: false };
      } else {
        ctx.body = { error: true };
      }
    } catch (e) {
      console.error('======>>>>>>importProductyzPrice error', e);
      ctx.body = { error: true };
    }
  }


  /** 下载商品文件 */
  public async downloadNewAll() {
    const { ctx } = this;


    const fileOut = await ctx.service.uploadCustum.localFileTurnToworsheet({ filepath: path.join('app', 'public', 'baseData', '全部商品.xlsx') });
    const dataFromExcel = JSON.parse(fileOut[0])?.['全部商品查看'];

    const dataWithIndex = await ctx.service.sortSxExcel.arrIndex(
      dataFromExcel?.[0],
    );
    const lengthEx = dataFromExcel[0]?.length;
    try {
      if (!lengthEx) throw Error('发生错误');
      const ProductNewAll: ProductNewType[] = await ctx.model.ProductNew.find();
      await Promise.all(ProductNewAll.map(async thisFindP => {
        const temp = Array(lengthEx).fill('');
        /**  商品编码（管家婆）	商品条码（有赞）
         * 食享商品名称	有赞商品名称	管家婆商品全名
         * 食享规格	管家婆规格
         *
         * 单位（食享）	单位（有赞）	管家婆对应单位
         * 管家婆农贸生鲜价格	管家婆二批价格	管家婆餐饮价格	有赞南佐配送价格	有赞餐饮价格	有赞A96价格
        */
        temp[dataWithIndex['商品编码（管家婆）']] = thisFindP?.code;
        temp[dataWithIndex['商品条码（有赞）']] = thisFindP?.barCode;

        temp[dataWithIndex['食享商品名称']] = thisFindP?.sxName;
        temp[dataWithIndex['有赞商品名称']] = thisFindP?.yzName;
        temp[dataWithIndex['管家婆商品全名']] = thisFindP?.gjname;

        temp[dataWithIndex['食享规格']] = thisFindP?.sxspecifications;
        temp[dataWithIndex['管家婆辅助单位']] = thisFindP?.gjspecifications;


        const unitDetailFilter: ProductDetailType[] = await ctx.model.ProductDetail.find({ code: thisFindP.code });
        const unitDetailLength = unitDetailFilter?.length;
        for (let i = 0; i < unitDetailLength; i++) {
          const tempunitDetailFilter = unitDetailFilter[i];
          temp[dataWithIndex['单位（食享）']] = tempunitDetailFilter?.sxunit;
          temp[dataWithIndex['单位（有赞）']] = tempunitDetailFilter?.yzunit;
          temp[dataWithIndex['管家婆对应单位']] = tempunitDetailFilter?.gjunit;
          temp[dataWithIndex['管家婆农贸生鲜价格']] = tempunitDetailFilter?.gjretailPrice;
          temp[dataWithIndex['管家婆二批价格']] = tempunitDetailFilter?.gjwholesPrice;
          temp[dataWithIndex['管家婆餐饮价格']] = tempunitDetailFilter?.gjrestPrice;
          temp[dataWithIndex['有赞南佐配送价格']] = tempunitDetailFilter?.yzretailPrice;
          temp[dataWithIndex['有赞餐饮价格']] = tempunitDetailFilter?.yzrestPrice;
          temp[dataWithIndex['有赞A96价格']] = tempunitDetailFilter?.yzwholesPrice;
          dataFromExcel.push([...temp]);
        }

      }));

      const streamFile = await ctx.service.uploadCustum.makeTempCustom(dataFromExcel, '全部商品查看');
      ctx.set('Content-Type', 'application/octet-stream');
      ctx.attachment('全部商品.xlsx');

      ctx.body = streamFile;
    } catch (e) {
      console.error('======>>>>>>downloadNewAll error', e);
      ctx.body = { error: true };
    }
  }
  /** 将下载的文件重新完整导入进来 */
  public async importNewAllfromSelf() {
    const { ctx } = this;

    const fileOut: any[] = await ctx.service.uploadCustum.fileTurnToworsheet();
    try {
      if (fileOut.length > 0) {
        const filnalArr =
          (await ctx.service.baseProductNewOperate.importNewAllfromSelfSore(
            JSON.parse(fileOut[0])?.['全部商品查看'],
          )) || [];

        await ctx.model.ProductNew.deleteMany({});
        await ctx.model.ProductDetail.deleteMany({});
        await ctx.service.baseProductNewOperate.importProductUpdate(filnalArr as ProductNewType[], 'baseWayGj');

        ctx.body = { error: false };
      } else {
        ctx.body = { error: true };
      }
    } catch (e) {
      console.error('======>>>>>>importNewAllfromSelf error', e);
      ctx.body = { error: true };
    }
  }
  /** 有赞转换 */
  public async transformProductyz() {
    const { ctx } = this;
    const paramDep: ProductYzTransform = ctx.request.query;
    const comeDate = ctx.request.body;
    const fileOut: any[] = await ctx.service.uploadCustum.fileTurnToworsheet();
    try {
      const finalData: any =
        await ctx.service.baseProductNewOperate.transformProductyz(
          getKeyFrist(JSON.parse(fileOut[0])),
          getKeyFrist(JSON.parse(fileOut[1])),
          {
            ...paramDep,
            otherRouterAndDep: JSON.parse(comeDate?.other || []),
          },
        );


      const fileName = `SalesOrderYZ${Date.now()}`;

      await ctx.service.uploadCustum.makeBook(
        finalData.baseDetail || [],
        '单据明细',
        fileName,
      );

      const filePath = `/public/download/exportConversion/${fileName}.xls`;
      await ctx.service.baseRecordoOperate.addLogOfLogInPerson();
      ctx.body = {
        fileName: filePath,
        productToday: finalData.productToday,
        newConstomes: finalData.newConstomes,
        productNew: finalData.productNew,
        samePhone: finalData.samePhone,
      };
      setTimeout(() => {
        fs.unlink(path.join(__dirname, `./../${filePath}`), e => {
          console.log('=====>>>>transformProductyz free file', e);
        });
      }, 12 * 1000);

    } catch (error) {
      console.error('transformProductyz', error);
      ctx.body = { error: true };
    }
  }

  /** 食享转换 */
  public async transformsxProduct() {
    const { ctx } = this;
    const paramDep = ctx.request.query;
    const comeDate = ctx.request.body;
    const fileOut: any[] = await ctx.service.uploadCustum.fileTurnToworsheet();
    try {
      const finalData: any =
        await ctx.service.baseProductNewOperate.transformProduct(
          JSON.parse(fileOut[0])?.['订单销售报表'],
          JSON.parse(fileOut[0])?.['商品明细'],
          paramDep?.dep,
          paramDep?.difference,
          {
            otherRouter: JSON.parse(comeDate?.otherRouter || ''),
            otherDepartment: comeDate?.otherDepartment || '',
          },
        );


      const fileName = `SalesOrderImport${Date.now()}`;

      await ctx.service.uploadCustum.makeBook(
        finalData.baseDetail || [],
        '单据明细',
        fileName,
      );

      const filePath = `/public/download/exportConversion/${fileName}.xls`;
      await ctx.service.baseRecordoOperate.addLogOfLogInPerson();
      ctx.body = {
        fileName: filePath,
        productToday: finalData.productToday,
        newConstomes: finalData.newConstomes,
        ProductNew: finalData.productNew,
      };
      setTimeout(() => {
        fs.unlink(path.join(__dirname, `./../${filePath}`), e => {
          console.log('=====>>>>transformProduct free file', e);
        });
      }, 11 * 1000);

    } catch (error) {
      console.error('----->>>>>>transformProductNew', error);
      ctx.body = { error: true };
    }
  }

}
