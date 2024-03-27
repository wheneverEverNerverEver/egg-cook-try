/* eslint-disable space-before-function-paren */
/* eslint-disable array-bracket-spacing */
/* eslint-disable @typescript-eslint/no-var-requires */
import { Service } from 'egg';
import * as XLSX from 'xlsx';
const fsNode = require('fs');
import { readFile } from 'xlsx';
const fs = require('mz/fs');
const path = require('path');
import { findIndex } from '../commonJs';

/**
 * UploadCustum Service
 */
export default class UploadCustum extends Service {
  /**
   * 处理数据
   * @param guanjiaArr 管家婆记导入
   * @param shixiangArr 有赞导入
   */
  public async changeEach(guanjiaArr: Array<any>, shixiangArr: Array<any>) {
    const arr1Length = guanjiaArr.length;
    const arr2Length = shixiangArr.length;
    if (arr1Length < 2 || arr2Length < 2) {
      return false;
    }

    // 商品编码（自编码）	商品名称（必填）
    // 行号	商品编号	商品全名	辅助单位	计量单位	零售价	商品成本	终端价格	预设售价3	二批价格


    const guanjiaArr0 = guanjiaArr[3];
    const shixiangArr0 = shixiangArr[1];
    // 找到手机号码对应的下标
    const bianmaweiIndex = findIndex(shixiangArr0, '商品编码（自编码）');
    const bianmaGuaIndex = findIndex(guanjiaArr0, '商品编号');
    const jiliangGuaIndex = findIndex(guanjiaArr0, '计量单位');

    const idMapJson: Array<any> = [
      ['轉換后'],
      [...guanjiaArr0],
    ];

    // 重複的計量單位忽略
    const recordItem = {};

    for (let i = 1; i < arr2Length; i++) {
      const bianmaNow = shixiangArr[i][bianmaweiIndex];
      for (let j = 3; j < arr1Length; j++) {
        const arr1Temp = guanjiaArr[j];
        const bianmaGujia = arr1Temp[bianmaGuaIndex];
        const jiliangGujia = arr1Temp[jiliangGuaIndex];

        if (bianmaNow + '' === bianmaGujia + '' && !recordItem[bianmaGujia + jiliangGujia]) {
          recordItem[bianmaGujia + jiliangGujia] = true;
          idMapJson.push([...arr1Temp]);
        }
      }
    }
    return {
      outComeExcel: idMapJson,
    };
  }
  /** 生成文件 */
  public async fileOutput(path, content) {
    return new Promise((resolve, reject) => {
      fsNode.writeFile(path, content, function (error) {
        if (error) {
          console.log('===>>>>>>>writeFile error', error);
          reject(error);
        } else {
          resolve(true);
        }
      });
    });
  }

  /** excel转换成json */
  public async toJson(workbook) {
    const result = {};
    workbook.SheetNames.forEach(function (sheetName) {
      const roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
      });
      if (roa.length) result[sheetName] = roa;
    });
    return JSON.stringify(result, 2 as any, 2);
  }
  /** csv转换成json */
  public async csvToJson(workbook) {
    const result = {};
    workbook.SheetNames.forEach(function (sheetName) {
      const roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
      });
      if (roa.length) result[sheetName] = roa;
    });
    return JSON.stringify(result, 2 as any, 2);
  }

  /** 将上传的文件转换成数据 */
  public async fileTurnToworsheet() {
    const { ctx } = this;
    const fileOut: any[] = [];

    for (const file of ctx.request.files) {
      console.log('filename: ' + file.filename);
      console.log('tmp filepath: ' + file.filepath);
      try {
        // 处理文件
        const worksheet = readFile(file.filepath, {
          type: 'array',
        });
        if (worksheet) {
          fileOut.push(await ctx.service.uploadCustum.toJson(worksheet));
        }
      } finally {
        // 需要删除临时文件
        await fs.unlink(file.filepath);
      }
    }
    return fileOut;
  }

  /** 将上传的文件转换成数据 */
  public async localFileTurnToworsheet(file: { filepath: string }) {
    const { ctx } = this;
    const fileOut: any[] = [];
    if (file) {
      try {
        // 处理文件
        const worksheet = readFile(file.filepath, {
          type: 'array',
        });
        if (worksheet) {
          fileOut.push(await ctx.service.uploadCustum.toJson(worksheet));
        }
      } finally {
        //
      }
    }
    return fileOut;
  }

  /** 整理产品Excel表格 */
  public async sortProduct(arrData: Array<any>) {
    const arrDataLength: number = arrData.length;
    if (arrDataLength < 2) {
      return false;
    }

    const arrData0 = arrData[0];

    const finalArry: Array<any> = [];
    const excelArry: Array<any> = [[...arrData[0]]];
    const finalJson: Record<any, any> = {};
    const gjMap: Record<any, any> = {};

    // 找到对应的下标
    const codeIdSx = findIndex(arrData0, '商品编码');
    const codeIdGj = findIndex(arrData0, '管家婆商品编号');
    const nameGj = findIndex(arrData0, '管家婆商品全名');
    const nameSx = findIndex(arrData0, '商品名称');
    const unitSx = findIndex(arrData0, '单位');
    const unitGj = findIndex(arrData0, '管家婆基本单位');

    for (let k = 1; k < arrDataLength; k++) {
      const nowSXCode = arrData[k][codeIdSx];
      const nowGjCode = arrData[k][codeIdGj];
      if (nowSXCode && nowGjCode) {
        const nowSXname = arrData[k][nameSx];
        const nowGjname = arrData[k][nameGj];
        const nowSunit = arrData[k][unitSx];
        const nowGjunit = arrData[k][unitGj];
        finalArry.push([
          nowSXCode,
          nowSXname,
          nowGjCode,
          nowGjname,
          nowSunit,
          nowGjunit,
        ]);

        gjMap[nowGjCode] = {
          name: nowGjname,
        };

        finalJson[nowSXCode] = {
          codeGj: nowGjCode,
          [nowSunit]: nowGjunit,
          nameGj: nowGjname,
          箱: '箱',
          件: '箱',
          ...(nowSXCode === 'R5155' ? { 包: '公斤' } : {}),
        };
      }
      const tempU = [...arrData[k]];
      if (tempU[codeIdGj]) {
        tempU[0] = nowGjCode;
      }

      excelArry.push([...tempU]);
    }

    return {
      jsonMap: JSON.stringify(finalJson),
      jsonA: { data: finalArry },
      excelArry,
      gjMap,
    };
  }

  /* 生成可导入管家婆的Excel文件*/
  public async makeBook(data, sheetName: string, fileName: string, isCsv?: boolean) {
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    XLSX.writeFile(
      wb,
      path.join('app', 'public', 'download', 'exportConversion', `${fileName}${isCsv ? '.csv' : '.xls'}`),
    );
  }
  // 生成加了管家婆编码的文件
  public async makeBookCustom(data) {
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '客户档案');

    XLSX.writeFile(
      wb,
      path.join('app', 'public', 'download', '客户档案new.xls'),
    );
  }
  public async makeTempCustom(data, tabName) {

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, tabName);

    return XLSX.write(
      wb,
      {
        type: 'buffer',
      },
    );
  }
}
