import { CustomerType } from './type';

export function findIndex(arr, name?: string) {
  const nameIo = name || '手机号码';
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === nameIo) {
      return i;
    }
  }
  return -1;
}

export function isPhone(phone) {
  return /[0-9]{11}/g.test(phone);
}

export function isEmpty(foo) {
  if (typeof foo === 'object') {
    return false;
  }
  return foo === '' || foo === null || foo === undefined;

}

export function compactObj(obj, fn = isEmpty) {
  for (const i in obj) {
    if (typeof obj[i] === 'object') {
      compactObj(obj[i], fn);
    }
    if (fn(obj[i])) {
      delete obj[i];
    }
  }
}

export function getValue(value?: string | number) {
  return Number(value) * 100 || 0;
}
export function getBackReallyNumber(value?: string | number) {
  return Number(value) / 100 || 0;
}

export function getBackReallyAfterAddNumber(a?: string | number, b?: string | number) {
  const total = getValue(a) + getValue(b);
  return getBackReallyNumber(total);
}


export function getBackReallyAfterRemoveNumber(a?: string | number, b?: string | number) {
  const total = getValue(a) - getValue(b);
  return getBackReallyNumber(total);
}

export function encodeValue(val) {
  if (val?.length > 200) {
    throw Error('字符太长');
  }
  return encodeURIComponent(val ?? '');
}

export function objectDecode(obj) {
  const aKey: Record<string, any> = {};
  Object.keys(obj).forEach(v => {
    const forEachII = obj[v];
    if (typeof forEachII === 'string') {
      aKey[v] = decodeValue(obj[v]);
    } else {
      aKey[v] = obj[v];
    }
  });
  return aKey;
}

export function arrDecode(arr) {
  if (!Array.isArray(arr)) {
    return arr;
  }
  const aKey: any[] = [];
  for (let i = 0; i < arr.length; i++) {
    const forEachII = arr[i];
    if (typeof forEachII === 'string' && forEachII) {
      aKey.push(decodeValue(forEachII));
    } else {
      aKey.push(forEachII);
    }
  }
  return aKey;
}

export function objectEncode(obj) {
  const aKey = {};
  Object.keys(obj).forEach(v => {
    const forEachII = obj[v];
    if (typeof forEachII === 'string') {
      aKey[v] = encodeValue(obj[v]);
    } else {
      aKey[v] = obj[v];
    }
  });
  return aKey;
}

export function objectArrDecode(arrObj) {
  if (!Array.isArray(arrObj)) {
    return arrObj;
  }
  const aKey: any[] = [];
  for (let i = 0; i < arrObj.length; i++) {
    const forEachII = arrObj[i];
    if (typeof forEachII === 'object' && forEachII) {
      const finalObj = objectDecode(forEachII);
      aKey.push(finalObj);
    } else {
      aKey.push(forEachII);
    }
  }
  return aKey;
}

export function decodeValue(val) {
  return decodeURIComponent(val || '') || undefined;
}
export function changeSpecialCharacter(str?: any) {
  if (!str || typeof str !== 'string') { return str; }
  // StringBuilder retValue = new StringBuilder();
  const retValue: string[] = [];
  const str1 = '*.?+$^[](){}|\\/';
  for (let i = 0; i < str.length; i++) {
    let ss = str[i].toString();
    if (str1.indexOf(ss) > -1) {
      ss = '\\' + ss;
    }
    retValue.push(ss);
  }
  return retValue.join('');
}

/** 整理排序 */
export function sortParams(val?: Record<string, 'ascend' | 'descend' | undefined>) {
  if (!val) return undefined;
  const outObj = {};
  for (const item in val) {
    if (item) {
      const temp = val[item];
      if (temp === 'ascend') {
        outObj[item] = -1;
      } else if (temp === 'descend') {
        outObj[item] = 1;
      }
    }
  }
  return outObj;
}
/** 整理价格和单位 */
export function sortPriceUnit() {
  return [];
}

/** 根据发货状态，判断部门和经手人,已发货的经手人就是业务员，否则则是配送路线 */
export function wordsDistrict(
  // wayGiven: string,
  deliveryStatus: string,
  // baseInfo: ProductYzTransform,
  comstomsHad?: CustomerType) {
  // comstomsHad?.district || comstomsHad?.manager
  if (deliveryStatus === '已发货') {
    /** 对已发货的状态
 * 农都城时，分自提和同城配送
 * YW0201	【餐饮客户】--配送
   YW0202	【农贸客户】--配送
   YW0203	【生鲜客户】--配送
   YW0204	【批发客户】--配送
   YW0209	【新零售】--配送
   YW0205	【鹏和零售客户】--自提
   YW0206	【五丰市场客户】--配送
   YW0207	【农都城-自提客户】
   YW0208	【农都城-配送客户】
 */
    /** 店铺
     * 584409832	南佐潮缘线上商城
    386116040	南佐配送（鹏和店）
    328208804	南佐潮缘1楼A96号（农都店）
    643005518	南佐餐饮（鹏和店）
     */
    // const objectOut = {
    //   328208804: {
    //     同城送: 'YW0208',
    //     自提: 'YW0207',
    //   },
    //   default: {
    //     同城送: '',
    //     自提: '',
    //   },
    // };
    return {
      manager: 'YWN42', // 有赞已发货
      department: 'YZSH10', // objectOut?.[baseInfo?.belong ?? 'default']?.[wayGiven],
    };
  }
  // if (wayGiven === '同城送') { 自提也默认送
  return {
    manager: comstomsHad?.district || comstomsHad?.manager,
    department: '',
  };
  // }
  // return {
  //   manager: 'YWN36',
  //   department: 'gzlk18',
  // };
}


export function wordsDistrictSX(freightPrice: number, wayGiven) {
  if (wayGiven === '平台配送') {
    if (freightPrice > 0) {
      return {
        manager: 'YWN36',
        department: 'gzlk40',
      };
    }
    return {
      manager: '',
      department: '',
    };
  }
  return {
    manager: 'YWN36',
    department: 'gzlk18',
  };
}

