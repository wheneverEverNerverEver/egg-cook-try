/* eslint-disable array-bracket-spacing */
/* eslint-disable jsdoc/check-param-names */
/* eslint-disable @typescript-eslint/no-var-requires */
import { Service } from 'egg';
const mubanJson = require('./../public/download/muban.json');
const mubanIndexJson = require('./../public/download/mubanIndex.json');
const productJson = require('./../public/download/productMap.json');
const moment = require('moment');
import { findIndex, getValue, getBackReallyNumber } from './../commonJs';
import { ArrayD, DiscountDetail } from './../commonJs/type';

/**
 * 管家婆導入模板
 *
 * "录单日期" === "付款时间"     "单据编号"==="订单号"  "单据类型"==="销售单"  "往来单位编号"==="用户ID"
  "往来单位全名"*    "经手人编号"==="员工编号"  "经手人全名"*  "部门编号"==="gzlk11"   "部门全名"*
  "收/付款日期"*  "仓库编号"==="06"    "仓库全名"*   "摘要"!!!!!!    "附加说明"!!!!!
  "制单人编号"==="02"  "制单人"*  "收/付款账户编号"==="0154"  "收/付款金额"==="订单实付金额"    "交货日期(订单专用)"*
  "优惠"!!!     "商品编号"==="商品编码" "商品全名"*  "仓库编号"==="06" "仓库全名"*   "单位"==="商品购买数量"!!!!!
  "生产日期"*  "有效期至"* "批号"*  "数量"==="商品购买数量"!!!!! "单价"==="商品销售价格"    "金额"*  "折扣"*   "折后单价"*
  "折后金额"*  "税率"* "税额"* "含税单价"*  "含税金额"* "单据备注"===""   "对方商品编号*
 */
/**
 * 用户ID
 * 活动立减  运费
 * 活动立减 满减优惠 红包 优惠券 优惠抹零 会员折扣
 */

// 在discountOb[“用户Id+Total”] 中，各个订单实付金额路径

export default class SortSxExcel extends Service {
  /**
   * sayHi to you
   * @param name - 报表和明细
   */
  public async resortData(
    arrReport: ArrayD,
    arrProduct: ArrayD,
    arrList: ArrayD,
  ) {
    const { ctx } = this;
    const arrReportLen = arrReport?.length || 0;
    const arrProductLen = arrProduct?.length || 0;
    const arrListLen = arrList?.length || 0;

    if (arrReportLen < 1 || arrProductLen < 1 || arrListLen < 1) return [];
    // 订单销售报表中记录关于优惠的数据
    const discountOb: Record<string, DiscountDetail> = { };
    // 记录一个客户名下所有订单
    const sameUserId: Record<string, number[]> = { };

    const reportIndex = await ctx.service.sortSxExcel.arrIndex(arrReport[0]);
    const productListIndex = await ctx.service.sortSxExcel.arrIndex(
      arrProduct[0],
    );

    const remarksObj: Record<string, string> = { };

    const productToday: ArrayD = [];

    const productList0 = arrList[0];
    const codehzId = findIndex(productList0, '商品编码');
    const namehzId = findIndex(productList0, '商品名称');

    for (let m = 1; m < arrListLen; m++) {
      const codeN = arrList[m][codehzId];
      const nameN = arrList[m][namehzId];
      productToday.push([codeN, nameN, productJson[codeN]?.nameGj]);
    }

    for (let i = 1; i < arrReportLen; i++) {
      /** =====》》》》 金额最多两位数，为了计算精确，将数值乘以100后再做计算 */
      const lijian = getValue(arrReport[i][reportIndex['活动立减']]);
      const yunfei = getValue(arrReport[i][reportIndex['运费']]);
      const redPacket = getValue(arrReport[i][reportIndex['红包']]);
      const coupon = getValue(arrReport[i][reportIndex['优惠券']]);
      const preferentialErasure = getValue(
        arrReport[i][reportIndex['优惠抹零']],
      );
      const memberDiscount = getValue(arrReport[i][reportIndex['会员折扣']]);
      const paidInAmount = getValue(arrReport[i][reportIndex['实付金额']]);

      const dingdanhao = arrReport[i][reportIndex['订单号']];
      const userIdNow = arrReport[i][reportIndex['用户ID']];
      const distributionMode = arrReport[i][reportIndex['配送方式']];

      discountOb[dingdanhao] = {
        activityReduction: lijian,
        freight: yunfei,
        totalDiscount:
          lijian + redPacket + coupon + preferentialErasure + memberDiscount,
        paidInAmount,
        distributionMode,
      };
      if (sameUserId[userIdNow]) {
        sameUserId[userIdNow].push(dingdanhao);
      } else {
        sameUserId[userIdNow] = [dingdanhao];
      }
    }

    // 商品明细中取具体信息
    const baseDetail: ArrayD = JSON.parse(JSON.stringify(mubanJson?.data));

    const baseLength = baseDetail?.[1]?.length;

    if (baseLength < 1) {
      return [];
    }

    // eslint-disable-next-line array-callback-return
    Object.keys(sameUserId).map(sameid => {
      // 实付金额、优惠、立减三项需要每个订单累加的值，以及流水对账中显示金额的累加方式
      const orderAArrayInThisUser = sameUserId[sameid];
      const sameIdLength = orderAArrayInThisUser.length;

      /** 名下订单优惠叠加*/
      let totalDiscount = 0;
      /** 名下订单运费叠加*/
      let freight = 0;
      /** 名下订单立减叠加*/
      let activityReduction = 0;
      /** 名下订单各个订单金额累积方式 数组*/
      const accumulationMethodOfAmountArr: number[] = [];
      /** 名下订单实付总金额*/
      let paidInAmount = 0;
      /** 默认自提 ,名下订单有一个是平台配送即是平台配送*/
      let distributionMode = '上门自提';
      const freightObj: Record<string, number> = { };

      /** 备注 */
      const remarksRecord: ArrayD = [];
      const remarksRecordObj: Record<string, boolean> = { };


      // 先产品一步，将同一下单用户名下的所有订单的优惠信息等叠加
      orderAArrayInThisUser.forEach(nowOrderInI => {
        /** 当前订单号对应的折扣金额方面的细节*/
        const orderItemNow = discountOb[nowOrderInI];
        totalDiscount += orderItemNow.totalDiscount;
        const nowFreight = orderItemNow.freight;
        freight += nowFreight;
        activityReduction += orderItemNow.activityReduction;
        paidInAmount += orderItemNow.paidInAmount;
        accumulationMethodOfAmountArr.push(
          orderItemNow.paidInAmount - nowFreight,
        );
        if (nowFreight > 0) {
          accumulationMethodOfAmountArr.push(nowFreight);
        }
        freightObj[nowOrderInI] = nowFreight / 100;

        if (orderItemNow.distributionMode === '平台配送') {
          distributionMode = '平台配送';
        }
      });
      /** ===》》》》  之前因为金额最多两位数，为了计算精确，将数值乘以100后再做计算 ； 这里要除以100 ，恢复原来的数值*/
      const accumulationMethodOfAmount = accumulationMethodOfAmountArr
        .map(v => getBackReallyNumber(v))
        .join('+');
      paidInAmount = getBackReallyNumber(paidInAmount);
      activityReduction = getBackReallyNumber(activityReduction);
      freight = getBackReallyNumber(freight);
      totalDiscount = getBackReallyNumber(totalDiscount);

      /** ====>>>>> */

      for (let i = 0; i < sameIdLength; i++) {
        // 当前i中订单号
        const nowOrderInI = orderAArrayInThisUser[i];
        // 遍历明细中的订单号，对一样的订单号做处理
        for (let j = 0; j < arrProductLen; j++) {
          const value = arrProduct[j];
          if (value) {
            // 当前j中订单号
            const orderNumber = value[productListIndex['订单号']];
            if (orderNumber === nowOrderInI) {
              const productId = value[productListIndex['商品编码']];

              const salerId = value[productListIndex['员工编号']];

              const tempItem = Array(baseLength).fill('');
              tempItem[mubanIndexJson['录单日期']] =
                moment().format('YYYY-MM-DD');

              // 名下所有订单用第一个订单号
              tempItem[mubanIndexJson['单据编号']] = orderAArrayInThisUser[0];


              const comstomsCode = value[productListIndex['三方用户ID']];

              tempItem[mubanIndexJson['往来单位编号']] = comstomsCode;

              /** 是否新客户 */


              tempItem[mubanIndexJson['经手人编号']] = salerId;

              tempItem[mubanIndexJson['收/付款金额']] =
                paidInAmount - freightObj[orderNumber];

              tempItem[mubanIndexJson['优惠']] = totalDiscount;

              tempItem[mubanIndexJson['商品编号']] = productId;

              tempItem[mubanIndexJson['单据类型']] = '销售单';
              tempItem[mubanIndexJson['部门编号']] = 'gzlk11';// '2222222';//
              // "gzlk11";
              tempItem[mubanIndexJson['仓库编号']] = '06';
              tempItem[10] = '06';
              // 肥牛特殊仓库
              if (productId === 'R4412') {
                tempItem[10] = '05';
              }
              tempItem[mubanIndexJson['制单人编号']] = '02';
              tempItem[mubanIndexJson['收/付款账户编号']] = '0154';
              const numberUnitArr =
                value[productListIndex['商品购买数量']].split('.0'); // 1.0包
              tempItem[mubanIndexJson['数量']] = numberUnitArr[0];
              tempItem[mubanIndexJson['单位']] =
                productJson[productId]?.[numberUnitArr[1]] ?? '';

              const onePrice = value[productListIndex['商品销售价格']];

              const priceV = onePrice * parseFloat(numberUnitArr[0]);

              tempItem[mubanIndexJson['金额']] = priceV;

              tempItem[mubanIndexJson['单价']] = onePrice;
              const remarkThis = value[productListIndex['买家备注']];
              if (remarkThis && !remarksRecordObj[nowOrderInI]) {
                remarksRecordObj[nowOrderInI] = true;
                remarksRecord.push(remarkThis);
              }

              const remome = `立减${activityReduction}，总优惠${totalDiscount}，运费${freight}`;

              tempItem[
                mubanIndexJson['摘要']
              ] = `${accumulationMethodOfAmount}未打印，${remome}`;

              const finalRe = remarksRecord.length > 0 ? `【买家备注：${remarksRecord.join('。')}】` : '';

              tempItem[
                mubanIndexJson['附加说明']
              ] = `${accumulationMethodOfAmount},${remome}${distributionMode === '上门自提' ? '【上门自提】' : ''
              }。`;
              if (finalRe) {
                remarksObj[orderAArrayInThisUser[0]] = finalRe;
              }

              baseDetail.push(tempItem);
            }
          }
        }
      }
    });

    for (let i = 2; i < baseDetail.length; i++) {
      const detailThis = baseDetail[i];
      const detailOrderId = detailThis?.[mubanIndexJson['单据编号']];
      if (detailOrderId && remarksObj[detailOrderId]) {
        const tempFu = baseDetail[i][mubanIndexJson['附加说明']];
        baseDetail[i][mubanIndexJson['附加说明']] = tempFu + remarksObj[detailOrderId];
      }
    }
    return { baseDetail, productToday, remarksObj, fuIndex: mubanIndexJson['附加说明'] };
  }

  public async arrIndex(arr: ArrayD) {
    const arrLen = arr?.length;
    if (!arrLen) {
      return { };
    }
    const indexWith: Record<any, any> = { };
    for (let i = 0; i < arrLen; i++) {
      const tempArrItem = arr[i];
      if (tempArrItem) {
        indexWith[tempArrItem] = i;
      }
    }
    return { ...indexWith };
  }
}
