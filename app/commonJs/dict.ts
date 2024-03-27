import { ProductTypeDictType, ProductDetailType } from './type';

// export type ProductTypeDictType='youzan.retail' | 'youzan.wholesale' | 'youzan.restaurant'| 'shixiang'|'youzan'|'baseWayGj';

const priceWithNameOfParamDict:Partial<Record<ProductTypeDictType, Array<keyof ProductDetailType> | keyof ProductDetailType >> = {
  baseWayGj: [ 'gjretailPrice', 'gjrestPrice', 'gjwholesPrice' ],
  'youzan.restaurant': 'yzrestPrice',
  'youzan.retail': 'yzretailPrice',
  'youzan.wholesale': 'yzwholesPrice',
};

const priceDownloadType:Partial<ProductTypeDictType>[] = [ 'youzan.wholesale', 'youzan.retail', 'youzan.restaurant', 'baseWayGj' ];
const priceGivenType:ProductTypeDictType[] = [ 'youzan.wholesale', 'youzan.retail', 'youzan.restaurant', 'baseWayGj', 'shixiang' ];
// 下载商品的两个类别

const typeDict:ProductTypeDictType[] = [ 'shixiang', 'youzan' ];

const paramWord:Record<ProductTypeDictType, keyof ProductDetailType> = {
  shixiang: 'sxunit',
  youzan: 'yzunit',
  baseWayGj: 'gjunit',
  'youzan.restaurant': 'yzunit',
  'youzan.wholesale': 'yzunit',
  'youzan.retail': 'yzunit',
};

/**
 *
 * 584409832	南佐潮缘线上商城  ---------------->>>>>
 * 386116040	南佐配送（鹏和店）---------------->>>>>农贸生鲜---------->>>01 retail
 * 328208804	南佐潮缘1楼A96号（农都店）------->>>>> 二批价格  -------->>>>03 wholes
 * 643005518	南佐餐饮（鹏和店）---------------->>>>>餐饮价格 ---------->>>06 rest
 * 价格的匹配
 */
const basicHomologous = {
  386116040: {
    project: '01',
    name: '南佐配送（鹏和店）',
    price: 'yzretailPrice',
    gjPrice: 'gjretailPrice',
  },
  328208804: {
    name: '南佐潮缘1楼A96号（农都店）',
    project: '03',
    price: 'yzwholesPrice',
    gjPrice: 'gjwholesPrice',
  },
  643005518: {
    project: '06',
    name: '南佐餐饮（鹏和店）',
    price: 'yzrestPrice',
    gjPrice: 'gjrestPrice',
  },
};

export {
  priceWithNameOfParamDict,
  priceDownloadType,
  typeDict,
  paramWord,
  priceGivenType,
  basicHomologous,
};
