import { Controller } from 'egg';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

export default class HomeController extends Controller {
  public async index() {
    const { ctx } = this;
    await ctx.render('index.ejs', {
      data: await ctx.service.test.sayHi('egger'),
      token: ctx.csrf,
    });
  }
  public async indexPage() {
    const { ctx } = this;
    await ctx.render('indexCustom.ejs', {
      data: 'world ',
      token: ctx.csrf,
    });
  }
  public async indexCompose() {
    const { ctx } = this;
    await ctx.render('indexCompose.ejs', {
      data: 'world ',
      token: ctx.csrf,
    });
  }
  // indexProduct
  public async indexProduct() {
    const { ctx } = this;
    await ctx.render('indexProduct.ejs', {
      data: 'world ',
      token: ctx.csrf,
    });
  }

  public async uploadCustum() {
    const { ctx } = this;
    const fileOut: any[] = await ctx.service.uploadCustum.fileTurnToworsheet();

    if (fileOut.length > 1) {
      // 对比数据，将码互相转换
      const filnalJson: Record<any, any> =
        (await ctx.service.uploadCustum.changeEach(
          JSON.parse(fileOut[0])?.['导出数据'],
          JSON.parse(fileOut[1])?.['Sheet1'],
        )) || {};

      // await ctx.service.uploadCustum.fileOutput(
      //   path.join('app', 'public', 'download', 'customiDInfo.json'),
      //   filnalJson.codeMap,
      // );

      // await ctx.service.uploadCustum.fileOutput(
      //   path.join('app', 'public', 'download', 'arrayCumstoms.txt'),
      //   JSON.stringify(filnalJson.codeArray),
      // );

      // await ctx.service.uploadCustum.fileOutput(
      //   path.join('app', 'public', 'download', 'arrayCumstomsFail.txt'),
      //   JSON.stringify(filnalJson.failData),
      // );

      // await ctx.service.uploadCustum.fileOutput(
      //   path.join('app', 'public', 'download', 'customiDMap.json'),
      //   JSON.stringify(filnalJson.outComeExcel),
      // );

      await ctx.service.uploadCustum.makeBook(
        filnalJson.outComeExcel,
        '导出数据',
        'new物价管理',
      );

      ctx.body = filnalJson.outComeExcel.length;
    } else {
      ctx.body = { error: true };
    }
  }
  public async uploadProduct() {
    const { ctx } = this;
    const fileOut: any[] = await ctx.service.uploadCustum.fileTurnToworsheet();
    const dataFromExcel: Record<any, any> =
      (await ctx.service.uploadCustum.sortProduct(
        JSON.parse(fileOut[0])?.['库存状况表'],
      )) || {};

    try {
      await ctx.service.uploadCustum.fileOutput(
        path.join('app', 'public', 'download', 'productMap.json'),
        dataFromExcel.jsonMap,
      );

      await ctx.service.uploadCustum.fileOutput(
        path.join('app', 'public', 'download', 'productArray.txt'),
        JSON.stringify(dataFromExcel.jsonA),
      );

      await ctx.service.uploadCustum.fileOutput(
        path.join('app', 'public', 'constra', 'productGj.json'),
        JSON.stringify(dataFromExcel.gjMap),
      );

      await ctx.service.uploadCustum.makeBook(
        dataFromExcel.excelArry,
        '库存状况表',
        '库存查询new',
      );

      ctx.body = JSON.parse(fileOut[0])?.['库存状况表'];
    } catch (e) {
      ctx.body = { error: true };
    }
  }
  // 模板导入
  public async uploadMuban() {
    const { ctx } = this;
    const fileOut: any[] = await ctx.service.uploadCustum.fileTurnToworsheet();

    const dataFromExcel: Record<any, any> = {
      data: JSON.parse(fileOut[0])?.['单据明细'],
    };

    const dataWithIndex = await ctx.service.sortSxExcel.arrIndex(
      JSON.parse(fileOut[0])?.['单据明细']?.[1],
    );

    await ctx.service.uploadCustum.fileOutput(
      path.join('app', 'public', 'download', 'muban.json'),
      JSON.stringify(dataFromExcel),
    );

    await ctx.service.uploadCustum.fileOutput(
      path.join('app', 'public', 'download', 'mubanIndex.json'),
      JSON.stringify(dataWithIndex),
    );

    ctx.body = dataWithIndex;
  }
  //
  public async uploadSalesOrder() {
    const { ctx } = this;

    const fileOut: any[] = await ctx.service.uploadCustum.fileTurnToworsheet();

    try {
      const finalData: any = await ctx.service.sortSxExcel.resortData(
        JSON.parse(fileOut[0])?.['订单销售报表'],
        JSON.parse(fileOut[0])?.['商品明细'],
        JSON.parse(fileOut[0])?.['商品汇总'],
      );

      await ctx.service.uploadCustum.makeBook(
        finalData.baseDetail || [],
        '单据明细',
        'SalesOrderImport',
      );

      await ctx.service.uploadCustum.fileOutput(
        path.join('app', 'public', 'constra', 'today.txt'),
        JSON.stringify({ data: finalData.productToday }),
      );

      ctx.body = finalData || -1;
    } catch (e) {
      console.log('e,', e);
      ctx.body = { error: true };
    }
  }
}
