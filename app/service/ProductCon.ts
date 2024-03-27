import { Service } from 'egg';
import { findIndex } from '../commonJs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const productGj = require('../public/constra/productGj.json');

/**
 * Test Service
 */
export default class ProductCon extends Service {
  /**
   */
  public async constrctEach(fileData: Array<any>) {
    const fileDataLength = fileData.length;
    if (fileDataLength < 2) {
      return false;
    }
    const fileData0 = fileData[0];
    const codeFromSx = findIndex(fileData0, '商品编码');
    const nameFromSx = findIndex(fileData0, '商品名称');

    const success: Array<any> = [];
    const fail: Array<any> = [];

    for (let i = 1; i < fileDataLength; i++) {
      const nowItem = fileData[i];
      const codeNow = nowItem[codeFromSx];
      const NameNow = nowItem[nameFromSx];
      if (productGj[codeNow]) {
        success.push([ codeNow, NameNow, productGj[codeNow].name ]);
      } else {
        fail.push([ codeNow, NameNow ]);
      }
    }

    return {
      success: { data: success },
      fail: { data: fail },
    };
  }
}
