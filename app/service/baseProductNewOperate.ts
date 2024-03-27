/* eslint-disable array-bracket-spacing */
import { Service } from 'egg';
import { changeSpecialCharacter, compactObj, getValue, getBackReallyNumber, wordsDistrictSX, wordsDistrict, getBackReallyAfterAddNumber, getBackReallyAfterRemoveNumber } from '../commonJs';
import { ProductNewType, ProductDetailType, ArrayD, CustomerType, ProductYzTransform, DiscountDetailyz, DiscountDetail, ProductTypeDictType } from '../commonJs/type';
import { pick, indexOf as indexOfLo, flatten } from 'lodash';
import { paramWord, priceWithNameOfParamDict } from './../commonJs/dict';
import mubanIndexJson = require('./../public/download/mubanIndex.json');
import mubanJson = require('./../public/download/muban.json');
import moment = require('moment');
import findInLoadsh = require('lodash/findIndex');
import findOneInArrayLoadsh = require('lodash/find');
import { findIndex } from '../commonJs';

export default class baseProductNewOperate extends Service {
  /**
   * 新增
   */
  public async insertProductNew(productObj: ProductNewType) {
    const { ctx } = this;
    try {
      const { productDetail = [], code, ...rest } = productObj;

      const userFind: ProductNewType[] = await ctx.model.ProductNew.insertMany([{ ...rest, code }]);

      const productDetailArr = productDetail.map(v => ({
        productId: userFind?.[0]._id,
        code,
        ...v,
      }));

      const productDetailAdd = await ctx.model.ProductDetail.insertMany(productDetailArr);
      const productFind = pick(userFind, ['_id', 'code', 'barCode']);

      return {
        ...productFind,
        productDetail: productDetailAdd,
      };
    } catch (error) {
      return {};
    }
  }
  /**
   * 编辑
   */
  public async ProductNewUpdate(id: string, updateObj: ProductNewType) {
    const { ctx } = this;
    try {

      const { productDetail = [], ...rest } = updateObj;
      const productFind: ProductNewType = await ctx.model.ProductNew.findByIdAndUpdate(
        {
          _id: id,
        },
        { ...rest },
      );
      await ctx.model.ProductDetail.deleteMany({ productId: productFind._id });
      await Promise.all(productDetail.map(async v => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, ...restPro } = v;
        const pro = await ctx.model.ProductDetail.insertMany([{
          ...restPro,
          productId: productFind._id,
        }]);
        return pro;
      }));
      const productFindTe = pick(productFind, ['_id', 'gjname']);

      return {
        ...productFindTe,
      };
    } catch (error) {
      return false;
    }
  }

  /**
   * 删除
   */
  public async deleteProductNew(id: string) {
    const { ctx } = this;
    try {
      await ctx.model.ProductNew.deleteOne({
        _id: id,
      });
      await ctx.model.ProductNew.find({ _id: changeSpecialCharacter(id) });
      // 删除商品规格也删除
      await ctx.model.ProductDetail.deleteMany({ productId: id });
      return true;
    } catch (error) {
      return false;
    }
  }
  /** 找到唯一一个 */
  public async findProduct({ code, barCode, id }: { code?: string, barCode?: string, id?: string }): Promise<ProductNewType> {
    const { ctx } = this;
    try {
      const userFind: ProductNewType[] = await ctx.model.ProductNew.find(code ? {
        code: changeSpecialCharacter(code),
      } : (barCode ? {
        barCode: changeSpecialCharacter(barCode),
      } : {
        _id: changeSpecialCharacter(id),
      }));
      const productDetail = await ctx.model.ProductDetail.find({ productId: userFind?.[0]?._id });
      const userFind0: ProductNewType = pick(userFind?.[0] || {}, ['_id', 'code', 'barCode', 'gjname', 'sxName', 'yzName', 'yzspecifications', 'sxspecifications', 'gjspecifications']);
      return {
        ...userFind0,
        productDetail,
      };
    } catch (error) {
      console.error('findProduct', error);
      return {};
    }
  }
  /** 查询 */
  public async searchProductNew(searchParm: {
    limit: number;
    page: number;
  } & ProductNewType) {
    const { limit = 99, page = 1, code, gjname, sxName, yzName, barCode } = searchParm;
    const { ctx } = this;

    const limitNumber = Number(limit) || 99;
    const pageNumber = Number(page) || 1;
    const search = {
      code: code && { $regex: new RegExp(changeSpecialCharacter(code)), $options: 'i' },
      gjname: gjname && { $regex: new RegExp(changeSpecialCharacter(gjname)), $options: 'i' },
      sxName: sxName && { $regex: new RegExp(changeSpecialCharacter(sxName)), $options: 'i' },
      yzName: yzName && { $regex: new RegExp(changeSpecialCharacter(yzName)), $options: 'i' },
      barCode: barCode && { $regex: new RegExp(changeSpecialCharacter(barCode)), $options: 'i' },
    };
    compactObj(search);
    try {
      const data: ProductNewType[] = await ctx.model.ProductNew.find({ ...search })
        .sort('-updateTime')
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

      let productSpc: ProductDetailType[] = [];
      const outData = await Promise.all(data.map(async item => {
        if (item?.code) {
          productSpc = await ctx.model.ProductDetail.find({ productId: changeSpecialCharacter(item._id) });
        }
        const itemPick = pick(item, ['_id', 'code', 'barCode', 'gjname', 'sxName', 'yzName']);
        return {
          ...itemPick,
          productDetail: productSpc,
        };
      }));


      const total = await ctx.model.ProductNew.where({ ...search }).count();
      return {
        data: outData,
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

  /** 有赞订单转换 */
  public async transformProductyz(
    arrReport: ArrayD,
    arrProductyz: ArrayD,
    baseInfo: ProductYzTransform,
  ) {
    const { ctx } = this;
    const arrReportLen = arrReport?.length || 0;
    const arrProductyzLen = arrProductyz?.length || 0;

    if (arrReportLen < 1 || arrProductyzLen < 1) return [];
    // 订单销售报表中记录关于优惠的数据
    const discountOb: Record<string, DiscountDetailyz> = {};
    const reportIndex = await ctx.service.sortSxExcel.arrIndex(arrReport[0]);
    const productListIndex = await ctx.service.sortSxExcel.arrIndex(
      arrProductyz[0],
    );


    const productToday: ArrayD = [];// 包含的产品
    const productTodayObj: Record<string, boolean> = {};
    const productNew: ArrayD = []; // 新产品
    const newConstomes: ArrayD = []; // 新客户
    const samePhone: ArrayD = []; // 相同手机号
    const newConstomesObj: Record<string, boolean> = {};
    const samePhoneObj: Record<string, boolean> = {};
    /** 商品退款状态 */
    const produceBackWay = productListIndex['商品退款状态'];
    const reportproduceBackWay = reportIndex['订单退款状态'];// 订单表
    /** 订单号 */
    const orderIdIndex = productListIndex['订单号'];
    /** 商品金额小计 */
    // const priceSelfIndex = productListIndex['商品金额小计'];
    /** 商品发货状态 */
    const deliveryStatusIndex = productListIndex['商品发货状态'];

    const sameRegPhone = {};
    const remeberOneDingdangContainObj = {};
    const remeberOneDingdangContain = {};
    const remeberOneDingdangContainArr: ArrayD = [];

    /** 根据 订单销售报表 整理出每单的优惠运费等*/
    for (let i = 1; i < arrReportLen; i++) {
      const arrReportItem = arrReport[i];
      /** =====》》》》 金额最多两位数，为了计算精确，将数值乘以100后再做计算 */
      const totalDis = arrReportItem[reportIndex['店铺优惠合计']];
      const yunfei = arrReportItem[reportIndex['运费']];
      const youhuiWay = arrReportItem[reportIndex['店铺优惠方式']] || '';

      const paidInAmount = arrReportItem[reportIndex['订单实付金额']];

      const dingdanhao = arrReportItem[reportIndex['订单号']];
      const distributionMode = arrReportItem[reportIndex['订单配送方式']];
      const memo = (arrReportItem[reportIndex['买家备注']] || '').trim();
      const purchaseGot = arrReportItem[reportIndex['收货人手机号/提货人手机号']] || '';
      const purchaseAddGot = arrReportItem[reportIndex['详细收货地址/提货地址']] || '';
      const purchaseDeNameGot = arrReportItem[reportIndex['收货人/提货人']] || '';
      const sellermemoD = (arrReportItem[reportIndex['商家订单备注']] || '').trim();
      const belongStore = (arrReportItem[reportIndex['归属店铺']] || '').trim();

      // 收货基本信息
      const deliveryAddress = `${purchaseDeNameGot} ${purchaseGot} ${purchaseAddGot} `;


      const purchaseNameGot = arrReportItem[reportIndex['买家姓名']];
      const buyerGot = arrReportItem[reportIndex['买家手机号']];

      const produceBackIRe = arrReportItem[reportproduceBackWay];
      // 且订单状态是未发货，却显示退款成功
      // 订单状态 为 交易关闭的订单导入
      const stateOrder = arrReportItem[reportIndex['订单状态']];
      // 订单类型
      const fangshi = arrReportItem[reportIndex['付款方式']];

      const paidInAmountDevideYunfei = paidInAmount;

      if (stateOrder !== '交易关闭' && stateOrder !== '交易完成' && fangshi) {
        const haddingdanhaoBefore = sameRegPhone[buyerGot]?.dingdanhao;
        // 0、订单状态要相同 1、配送信息相等 2、配送信息不相等但是配送方式也不等
        // a、只有当都是同城送，但是地址不一样的时候才分单
        const onlyDevide = distributionMode === '同城送' && distributionMode === discountOb[haddingdanhaoBefore]?.distributionMode && deliveryAddress !== discountOb[haddingdanhaoBefore]?.baseDeliver;
        if (sameRegPhone[buyerGot] && haddingdanhaoBefore && stateOrder === discountOb[haddingdanhaoBefore].stateOrder && !onlyDevide) {
          const { paidInAmountArr = [], doHaveProductBack, sellerMemo, totalDiscount, totalDisWay, freight, paidInAmount, baseDeliver, ...tempBeforeDingdan } = { ...discountOb[haddingdanhaoBefore] };
          paidInAmountArr.push('+', `${paidInAmountDevideYunfei}`, `${yunfei - 0 > 0 ? '+' + yunfei : ''}`);
          const iHadRemeberIndex = remeberOneDingdangContainObj[haddingdanhaoBefore];
          if (iHadRemeberIndex !== undefined) {
            remeberOneDingdangContainArr[iHadRemeberIndex].push(dingdanhao);
          }
          remeberOneDingdangContain[dingdanhao] = haddingdanhaoBefore;
          // eslint-disable-next-line prefer-const
          let tempWayDeliver = distributionMode;
          let myNewBaseDeliver = deliveryAddress;
          if (tempBeforeDingdan.distributionMode === '同城送') {
            tempWayDeliver = '同城送';
            myNewBaseDeliver = baseDeliver || '';
          }
          discountOb[haddingdanhaoBefore] = {
            ...tempBeforeDingdan,
            paidInAmountArr,
            baseDeliver: myNewBaseDeliver,
            memo: memo ? `${tempBeforeDingdan.memo}|${memo}` : tempBeforeDingdan.memo,
            sellerMemo: sellermemoD ? `${sellerMemo}|${sellermemoD}` : sellerMemo,
            doHaveProductBack: !!produceBackIRe || doHaveProductBack,
            totalDisWay: youhuiWay ? totalDisWay + ',' + youhuiWay : totalDisWay,
            totalDiscount: totalDiscount + Math.abs(totalDis || 0),
            paidInAmount: getBackReallyAfterAddNumber(paidInAmount, paidInAmountDevideYunfei),
            freight: getBackReallyAfterAddNumber(freight, yunfei),
            distributionMode: tempWayDeliver,
            stateOrder,
          };

        } else {
          sameRegPhone[buyerGot] = {
            dingdanhao,
          };
          remeberOneDingdangContain[dingdanhao] = dingdanhao;
          if (remeberOneDingdangContainObj[dingdanhao] === undefined) {
            remeberOneDingdangContainArr.push([dingdanhao]);
            remeberOneDingdangContainObj[dingdanhao] = remeberOneDingdangContainArr.length - 1;
          }
          discountOb[dingdanhao] = {
            freight: yunfei,
            totalDisWay: youhuiWay,
            totalDiscount: Math.abs(totalDis || 0),
            paidInAmount: paidInAmountDevideYunfei,
            distributionMode,
            paidInAmountArr: [`${paidInAmountDevideYunfei}`, `${yunfei - 0 > 0 ? '+' + yunfei : ''}`],
            memo,
            sellerMemo: sellermemoD,
            name: purchaseNameGot,
            purchaserPhone: purchaseGot,
            doHaveProductBack: !!produceBackIRe,
            buyer: buyerGot,
            baseDeliver: deliveryAddress,
            belongStore,
            stateOrder,
          };
        }

      }
    }


    // 商品明细中取具体信息
    const baseDetail: ArrayD = JSON.parse(JSON.stringify((mubanJson as any)?.data));

    const baseLength = baseDetail?.[1]?.length;

    if (baseLength < 1) {
      return [];
    }

    const flattenremeberOneDingdangContainArr = flatten(remeberOneDingdangContainArr);
    const flattenremeberOneDingdangContainArrLen = flattenremeberOneDingdangContainArr.length;

    const goodOrderWithPriceAdnYouhui: Record<string, { priceTotle: number | string, youhui: number | string, }> = {};
    // 出现一个退款中|或退款成功（全额退款）即为有售后
    const doHaveProductBack: Record<string, boolean | undefined> = {};

    for (let m = 0; m < flattenremeberOneDingdangContainArrLen; m++) {
      let totalProductProduct = 0;
      let totalyouhuiProduct = 0;
      let hasSameOrder;
      for (let j = 0; j < arrProductyzLen; j++) {
        const value = arrProductyz[j];
        const nowOrderInI = value[orderIdIndex];
        const orderHebingHao = flattenremeberOneDingdangContainArr[m];
        const myOrderCont = remeberOneDingdangContain[nowOrderInI];


        if (nowOrderInI === orderHebingHao) {
          // 当前j中订单号

          const discountObNow = discountOb[myOrderCont];
          const productBarcode = (value[productListIndex['商品条码']] || '') + '';


          if (value && nowOrderInI && orderHebingHao && discountObNow && productBarcode) {
            hasSameOrder = myOrderCont;
            // 一个商品出现一个退款中|或退款成功（全额退款）即为有售后
            const tempProduct = value[productListIndex['商品退款状态']];
            if (!doHaveProductBack[hasSameOrder] && (tempProduct === '退款中' || tempProduct === '退款成功（全额退款）')) {
              doHaveProductBack[hasSameOrder] = true;
            }

            const tempItem = Array(baseLength).fill('');
            const barCodeTrim = productBarcode.replace(/(^\s*)|(\s*$)/g, '');

            const dbData = await this.findProduct({ barCode: barCodeTrim });

            tempItem[mubanIndexJson['单据编号']] = myOrderCont;
            tempItem[mubanIndexJson['商品编号']] = dbData?.code;

            const numberUnitArr = value[productListIndex['商品数量']];
            tempItem[mubanIndexJson['数量']] = numberUnitArr;
            const onePrice = value[productListIndex['商品单价']];
            const onePriceAndNum = Number(numberUnitArr) * Number(onePrice);// 原先多少金额
            // 每样商品实际原价
            totalProductProduct = getBackReallyAfterAddNumber(totalProductProduct, onePriceAndNum);
            // 每个商品优惠的
            const oneProductyouhui = getBackReallyAfterRemoveNumber(onePriceAndNum, value[productListIndex['商品实际成交金额']]).toFixed(2);
            totalyouhuiProduct = getBackReallyAfterAddNumber(totalyouhuiProduct, oneProductyouhui);
            const unitIndexWithYz = findInLoadsh(dbData?.productDetail, [
              'yzunit',
              value[productListIndex['商品规格']],
            ]);

            let unitGj = dbData?.productDetail?.[unitIndexWithYz]?.['gjunit'];
            // 有赞上有些商品没有规格，只有一个库存单位，所以用这种方式
            if (unitIndexWithYz < 0 && dbData?.code) {
              const filterEmpty = dbData?.productDetail?.filter(v => !!v.yzunit);
              if (filterEmpty?.length === 1) {
                unitGj = filterEmpty[0].gjunit;
              }
            }

            tempItem[mubanIndexJson['单位']] = unitGj;
            if (!productTodayObj[barCodeTrim]) {
              productTodayObj[barCodeTrim] = true;
              if (dbData?._id && unitGj && dbData?.code) {
                productToday.push(dbData);
              } else {
                productNew.push({ code: dbData?.code || barCodeTrim, name: value[productListIndex['商品名称']] });
              }
            }
            // 商品退款状态
            const produceBackI = productListIndex[produceBackWay];
            tempItem[mubanIndexJson['单据备注']] = produceBackI;


            tempItem[mubanIndexJson['录单日期']] =
              moment().format('YYYY-MM-DD');


            /** 经手人等 */
            const comstomsHad: CustomerType[] = await ctx.model.Customer.find({ phone: changeSpecialCharacter(discountObNow.buyer) }).sort('-trUsed');
            const comstomsCode = comstomsHad[0]?.code;
            if (comstomsHad.length > 1 && !samePhoneObj[discountObNow.buyer]) { // 手机号多个单位
              samePhoneObj[discountObNow.buyer] = true;
              samePhone.push({
                phone: discountObNow.buyer,
                name: comstomsHad?.map((v, index) => (index === 0 ? `【使用中：${v.name}】` : `【${v.name}】`))?.join(','),
              });
            }
            if (!comstomsCode && !newConstomesObj[discountObNow.buyer]) { // 手机号没有单位
              newConstomesObj[discountObNow.buyer] = true;
              newConstomes.push({
                phone: discountObNow.buyer,
                name: discountObNow.name,
              });
            }

            tempItem[mubanIndexJson['往来单位编号']] = comstomsCode || 'YZNEW001';
            /** YWN36 自提 */
            // discountObNow.distributionMode,    baseInfo,
            const manageDep = wordsDistrict(value[deliveryStatusIndex], comstomsHad?.[0]);

            const ifEqueOther = manageDep?.manager && Array.isArray(baseInfo?.otherRouterAndDep) && findOneInArrayLoadsh(baseInfo?.otherRouterAndDep ?? [], { router: manageDep?.manager });


            tempItem[mubanIndexJson['经手人编号']] = manageDep?.manager;

            tempItem[mubanIndexJson['部门编号']] = ifEqueOther ?
              ifEqueOther?.department : (manageDep?.department || baseInfo?.department);


            // 减去运费

            tempItem[mubanIndexJson['单据类型']] = '销售单';

            // const priceV = onePrice * parseFloat(numberUnitArr);value[productListIndex['商品金额小计']]
            tempItem[mubanIndexJson['金额']] = onePriceAndNum;// priceV;

            const productCheap = (value[productListIndex['商品优惠方式']] || '') + '  ' + oneProductyouhui;
            tempItem[mubanIndexJson['单据备注']] = productCheap;// priceV;

            tempItem[10] = baseInfo?.warehouse || '06';

            tempItem[mubanIndexJson['制单人编号']] = '02';
            tempItem[mubanIndexJson['收/付款账户编号']] = '0152';

            tempItem[mubanIndexJson['单价']] = onePrice;


            baseDetail.push(tempItem);
          }
        }
      }
      if (hasSameOrder) {
        const myOrderTemp = goodOrderWithPriceAdnYouhui[hasSameOrder];
        if (!myOrderTemp) {
          goodOrderWithPriceAdnYouhui[hasSameOrder] = {
            priceTotle: totalProductProduct.toFixed(2),
            youhui: totalyouhuiProduct.toFixed(2),
          };
        } else {
          const { priceTotle, youhui } = myOrderTemp;
          goodOrderWithPriceAdnYouhui[hasSameOrder] = {
            priceTotle: getBackReallyAfterAddNumber(totalProductProduct, priceTotle).toFixed(2),
            youhui: getBackReallyAfterAddNumber(totalyouhuiProduct, youhui).toFixed(2),
          };
        }

      }

    }
    // 最后整理金额和附加说明信息
    const baseDetailLength = baseDetail.length;
    for (let i = 2; i < baseDetailLength; i++) {
      const detailThis = baseDetail[i];
      const detailOrderId = detailThis?.[mubanIndexJson['单据编号']];
      const discountObNow = discountOb?.[detailOrderId];
      const readPrice = goodOrderWithPriceAdnYouhui?.[detailOrderId];
      if (detailOrderId && discountObNow && readPrice) {
        const remarkThis = discountObNow?.memo;


        const accumulationMethodOfAmount = discountObNow.paidInAmountArr?.join('');

        /** 归属店铺 名称*/
        const nameOfBelongEnStr = discountObNow?.belongStore;


        const finalSaeller = discountObNow?.sellerMemo ? `【卖家备注：${discountObNow?.sellerMemo}】` : '';
        const wholeYouhui = getBackReallyAfterAddNumber(discountObNow.totalDiscount, readPrice.youhui).toFixed(2);
        const payInPro = getBackReallyAfterRemoveNumber(discountObNow.paidInAmount, discountObNow.freight).toFixed(2);
        if (getBackReallyAfterRemoveNumber(payInPro, 0) === 0) {
          baseDetail[i][mubanIndexJson['收/付款金额']] = undefined;
          baseDetail[i][mubanIndexJson['收/付款账户编号']] = undefined;
        } else {
          baseDetail[i][mubanIndexJson['收/付款金额']] = payInPro;
        }
        baseDetail[i][mubanIndexJson['优惠']] = getBackReallyAfterRemoveNumber(readPrice.priceTotle, payInPro);
        const remome = `总优惠${wholeYouhui}，含商品优惠${readPrice.youhui},${discountObNow.totalDisWay || '无'},`;


        baseDetail[i][
          mubanIndexJson['摘要']
        ] = `${accumulationMethodOfAmount}未打印,${nameOfBelongEnStr}.${finalSaeller}`;

        const finalRe = remarkThis ? `【买家备注：${remarkThis}】` : '';


        if (doHaveProductBack?.[detailOrderId] && baseDetail[i][mubanIndexJson['部门编号']] !== 'YZSH10') {
          baseDetail[i][mubanIndexJson['部门编号']] = 'YZSH09';
          /** -----------------YZSH09 售后提醒---------------------------------------- */
        }

        baseDetail[i][
          mubanIndexJson['附加说明']
        ] = `${doHaveProductBack?.[detailOrderId] ? '有售后申请,' : ''}${discountObNow.purchaserPhone === discountObNow.buyer ? '' : 'LOOK!!'}[${nameOfBelongEnStr}],${accumulationMethodOfAmount},${remome}${discountObNow.distributionMode}.【${discountObNow.baseDeliver}】.${finalRe}`;

      }
    }

    return { baseDetail, productToday, productNew, newConstomes, samePhone };
  }

  /** 食享订单转换 */
  public async transformProduct(
    arrReport: ArrayD,
    arrProduct: ArrayD,
    paramDep?: string,
    difference?: string,
    other?: {
      otherRouter?: string[],
      otherDepartment?: string
    },
  ) {
    const { ctx } = this;
    const arrReportLen = arrReport?.length || 0;
    const arrProductLen = arrProduct?.length || 0;

    if (arrReportLen < 1 || arrProductLen < 1) return [];
    // 订单销售报表中记录关于优惠的数据
    const discountOb: Record<string, DiscountDetail> = {};
    // 记录一个客户名下所有订单
    const sameUserId: Record<string, number[]> = {};

    const reportIndex = await ctx.service.sortSxExcel.arrIndex(arrReport[0]);
    const productListIndex = await ctx.service.sortSxExcel.arrIndex(
      arrProduct[0],
    );

    const productPure = arrProduct;
    const productPureLen = productPure.length;
    /** ！！！！！！ 对电话号码排序 ，不同的地址对应的电话号码应该会不同*/
    const getPhoneIndex = productListIndex['收货人手机号码'];
    const getAddIndex = productListIndex['收货地址'];
    const getPeoIndex = productListIndex['收货人'];

    const productToday: ArrayD = [];
    const productTodayObj: Record<string, boolean> = {};

    const productNew: ArrayD = [];

    const remarksObj: Record<string, string> = {};

    const newConstomes: ArrayD = [];
    const newConstomesObj: Record<string, boolean> = {};


    /** 《《《《《《《使用用户ID及收货人手机号码作为标识，以区分同一客户不同的收货地址 》》》》》》*/

    /** 根据 订单销售报表 整理出每单的优惠运费等*/
    for (let i = 1; i < arrReportLen; i++) {
      /** =====》》》》 金额最多两位数，为了计算精确，将数值乘以100后再做计算 */
      const lijian = getValue(arrReport[i][reportIndex['活动立减']]);
      const yunfei = getValue(arrReport[i][reportIndex['运费']]);
      const redPacket = getValue(arrReport[i][reportIndex['红包']]);
      const coupon = getValue(arrReport[i][reportIndex['优惠券']]);
      const preferentialErasure = getValue(
        arrReport[i][reportIndex['优惠抹零']],
      );
      const fillPlus = getValue(arrReport[i][reportIndex['满减优惠']]);

      const memberDiscount = getValue(arrReport[i][reportIndex['会员折扣']]);
      const paidInAmount = getValue(arrReport[i][reportIndex['商品原价']]);

      const dingdanhao = arrReport[i][reportIndex['订单号']];
      const userIdNow = `${arrReport[i][reportIndex['用户ID']]}+${arrReport[i][reportIndex['收货人手机号码']]}+${arrReport[i][reportIndex['收货地址']]}`;
      const distributionMode = arrReport[i][reportIndex['配送方式']];

      const totalDis = lijian + redPacket + coupon + preferentialErasure + memberDiscount + fillPlus;

      discountOb[dingdanhao] = {
        activityReduction: lijian,
        freight: yunfei,
        totalDiscount: totalDis,
        paidInAmount: paidInAmount - totalDis,
        distributionMode,
      };
      if (sameUserId[userIdNow]) {
        sameUserId[userIdNow].push(dingdanhao);
      } else {
        sameUserId[userIdNow] = [dingdanhao];
      }
    }

    // 商品明细中取具体信息
    const baseDetail: ArrayD = JSON.parse(JSON.stringify((mubanJson as any)?.data));

    const baseLength = baseDetail?.[1]?.length;

    if (baseLength < 1) {
      return [];
    }

    const objectKeys = Object.keys(sameUserId);
    for (let m = 0; m < objectKeys.length; m++) {
      const sameid = objectKeys[m];
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
      const freightObj: Record<string, number> = {};
      /** 备注 */
      const remarksRecord: ArrayD = [];
      const remarksRecordObj: Record<string, boolean> = {};

      // 先产品一步，将同一下用户ID+手机号码下的所有订单的优惠信息等叠加
      orderAArrayInThisUser.forEach(async nowOrderInI => {
        /** 当前订单号对应的折扣金额方面的细节*/
        const orderItemNow = discountOb[nowOrderInI];
        totalDiscount += orderItemNow.totalDiscount;
        const nowFreight = orderItemNow.freight;
        freight += nowFreight;
        activityReduction += orderItemNow.activityReduction || 0;
        paidInAmount += orderItemNow.paidInAmount;
        accumulationMethodOfAmountArr.push(
          orderItemNow.paidInAmount,
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

      for (let i = 0; i < sameIdLength; i++) {
        // 当前i中订单号
        const nowOrderInI = orderAArrayInThisUser[i];
        // 遍历明细中的订单号，对一样的订单号做处理
        for (let j = 0; j < productPureLen; j++) {
          const value = productPure[j];
          if (value) {
            // 当前j中订单号
            const orderNumber = value[productListIndex['订单号']];
            if (orderNumber === nowOrderInI) {
              const tempItem = Array(baseLength).fill('');
              const productCode = value[productListIndex['商品编码']];
              tempItem[mubanIndexJson['商品编号']] = productCode;

              const dbData: ProductNewType = await this.findProduct(
                { code: productCode },
              );


              /** 单位转换 */
              const numberUnitArr =
                value[productListIndex['商品购买数量']].split('.0'); // 1.0包
              tempItem[mubanIndexJson['数量']] = numberUnitArr[0];

              const onePrice = value[productListIndex['商品销售价格']];
              const unitIndexWithSx = findInLoadsh(dbData?.productDetail, [
                'sxunit',
                numberUnitArr[1],
              ]);

              const unitGj = dbData?.productDetail?.[unitIndexWithSx]?.['gjunit'];
              tempItem[mubanIndexJson['单位']] = unitGj;

              if (dbData?.code && (!productTodayObj[dbData?.code] || !unitGj)) {
                productTodayObj[dbData?.code] = true;
                if (dbData?._id) {
                  productToday.push(dbData);
                } else {
                  productNew.push({ code: productCode, name: value[productListIndex['商品名称']] });
                }
              }

              tempItem[mubanIndexJson['录单日期']] =
                moment().format('YYYY-MM-DD');

              // 名下所有订单用第一个订单号
              tempItem[mubanIndexJson['单据编号']] = orderAArrayInThisUser[0];

              const comstomsCode = value[productListIndex['三方用户ID']];

              tempItem[mubanIndexJson['往来单位编号']] = comstomsCode;

              /** 是否有第三方客户ID */
              const selfCode = value[productListIndex['用户ID']];
              if (!comstomsCode && !newConstomesObj[selfCode]) {
                newConstomesObj[selfCode] = true;
                newConstomes.push({ id: selfCode, name: value[productListIndex['门店名称']], phone: value[productListIndex['电话号码']] });
              }

              tempItem[mubanIndexJson['收/付款金额']] = paidInAmount;

              tempItem[mubanIndexJson['优惠']] = totalDiscount;


              tempItem[mubanIndexJson['单据类型']] = '销售单';

              const priceV = onePrice * parseFloat(numberUnitArr[0]);
              tempItem[mubanIndexJson['金额']] = priceV;

              const gotDistrict: Array<CustomerType> = await ctx.model.Customer.find({ code: changeSpecialCharacter(comstomsCode) });
              /** YWN36 自提 */

              const manageDep = wordsDistrictSX(freight, distributionMode);

              const tempManager = manageDep?.manager || gotDistrict?.[0]?.district;
              const ifEqueOther = Array.isArray(other?.otherRouter) && tempManager && indexOfLo(other?.otherRouter, tempManager) > -1;

              tempItem[mubanIndexJson['经手人编号']] = tempManager;

              tempItem[mubanIndexJson['部门编号']] = ifEqueOther ? other?.otherDepartment : (manageDep?.department || (difference ? '' : paramDep || ''));

              tempItem[10] = '06';

              tempItem[mubanIndexJson['仓库编号']] = '06';

              tempItem[mubanIndexJson['制单人编号']] = '02';
              tempItem[mubanIndexJson['收/付款账户编号']] = '0154';

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

              /** 拼接收货人、电话、地址 */
              const phoneNow = value[getPhoneIndex];
              const addNow = value[getAddIndex];
              const peoNow = value[getPeoIndex];
              tempItem[
                mubanIndexJson['附加说明']
              ] = `${accumulationMethodOfAmount},${remome}${distributionMode === '上门自提' ? '【上门自提】' : ''
              }。【${peoNow},${phoneNow},${addNow}】`;
              if (finalRe) {
                remarksObj[orderAArrayInThisUser[0]] = finalRe;
              }
              baseDetail.push(tempItem);
            }
          }
        }
      }
    }

    for (let i = 2; i < baseDetail.length; i++) {
      const detailThis = baseDetail[i];
      const detailOrderId = detailThis?.[mubanIndexJson['单据编号']];
      if (detailOrderId && remarksObj[detailOrderId]) {
        const tempFu = baseDetail[i][mubanIndexJson['附加说明']];
        baseDetail[i][mubanIndexJson['附加说明']] = tempFu + remarksObj[detailOrderId];
      }
    }

    return { baseDetail, productToday, productNew, newConstomes };
  }

  /** 导入有赞商店，修改价格 */
  public async priceChangeYzAfterImport({ price, type }: {
    price: Record<string, Record<string, number>>
    type: 'youzan.retail' | 'youzan.wholesale' | 'youzan.restaurant'
  }) {
    const { ctx } = this;

    for (const keyCode in price) {
      for (const unit in price[keyCode]) {
        await ctx.model.ProductDetail.findOneAndUpdate({ code: keyCode, yzunit: unit }, {
          [priceWithNameOfParamDict[type as ProductTypeDictType] as keyof ProductDetailType]: (price[keyCode] as any)[unit],
        });
      }
    }


  }

  /**
   * 商品导入时的新增和更新
   * 只有在type是baseWayGj管家婆的时候，才可以新增
   * */
  public async importProductUpdate(filnalArray: ProductNewType[], type: ProductTypeDictType) {
    const { ctx } = this;
    if ((filnalArray?.length ?? 0) < 1) return { error: true };
    const filnalArrayLen = filnalArray.length;
    for (let i = 0; i < filnalArrayLen; i++) {
      const itemNow = filnalArray[i];
      const { code, productDetail, ...restItemNow } = itemNow;
      if (code) {
        const findOneIf: ProductNewType = await this.findProduct({ code });
        if (findOneIf?._id) {
          await ctx.model.ProductNew.updateOne(
            { code },
            {
              ...restItemNow,
              updateTime: Date.now(),
            },
          );
          // 对应管家婆的单位 一个商品最多只有两个单位,且管家婆商品一旦新建成功，不可更改规格，所以单位始终不变可用的
          const findOneIfProduct = findOneIf?.productDetail?.length || 0;
          await Promise.all((productDetail ?? []).map(async item => {
            // 如果是箱或者件，直接放进管家婆对应的箱的单位里
            const tempUnit = item?.[paramWord[type]];
            if (findOneIfProduct > 1) { // 两个单位这种
              if (tempUnit === '件' || tempUnit === '箱') {
                await ctx.model.ProductDetail.updateMany({ code, gjunit: { $in: '箱' } }, { ...item });
              } else if (tempUnit === '捆') {
                await ctx.model.ProductDetail.updateMany({ code, gjunit: { $in: '捆' } }, { ...item });
              } else if (tempUnit !== '件' && tempUnit !== '箱' && tempUnit !== '捆') {
                // 其他放在另一个，如果存在的话
                await ctx.model.ProductDetail.updateMany({ code, gjunit: { $nin: ['箱', '捆'] } }, { ...item });
              }
            } else if (findOneIfProduct === 1) {
              const oneUnit = findOneIf?.productDetail?.[0]?.gjunit;
              await ctx.model.ProductDetail.updateMany({ code, gjunit: { $in: oneUnit } }, { ...item });
            }
          }));

        } else if (type === 'baseWayGj') {
          await this.insertProductNew(
            { ...restItemNow, updateTime: Date.now(), code, productDetail },
          );
        }
      }
    }

    await ctx.service.baseRecordoOperate.addLogOfLogInPerson();
  }

  /** 食享数据导入 */
  public async importsxToDB(arrData: Array<any>): Promise<ProductNewType[]> {
    const fileDataLength = arrData.length;
    if (fileDataLength < 2) {
      return [];
    }
    const arrData0 = arrData[0];
    // 找到对应的下标
    const codeIdSx = findIndex(arrData0, '商品编码');
    const nameSx = findIndex(arrData0, '商品名称');
    const unitSx = findIndex(arrData0, '单位');
    const guigesx = findIndex(arrData0, '规格');

    const dataInner: Array<ProductNewType> = [];
    const dataObj: Record<string, boolean> = {};

    for (let k = 1; k < fileDataLength; k++) {

      const nowSXCode = arrData[k][codeIdSx];
      if (!dataObj[nowSXCode]) {
        dataObj[nowSXCode] = true;
        const nowSXname = arrData[k][nameSx];
        const nowSunit = arrData[k][unitSx];
        const nowGuigesx = arrData[k][guigesx];
        // 1件*10包
        const allUnitArr = nowGuigesx?.split('*');
        const unitSort: { sxunit: string }[] = [];
        const allUnitArrLen = allUnitArr?.length || 0;
        if (allUnitArrLen > 0) {
          for (let k = 0; k < allUnitArr.length; k++) {
            const tempUnit = allUnitArr?.[k]?.replace(/[1234567890]/g, '');
            if (((k === 0 && (tempUnit !== '件' && tempUnit !== '箱'))) || nowSunit === tempUnit) {
              unitSort.push({
                sxunit: tempUnit,
              });
              break;
            } else {
              unitSort.push({
                sxunit: tempUnit,
              });
            }
          }
        }

        dataInner.push({
          code: nowSXCode,
          sxName: nowSXname || '',
          sxspecifications: nowGuigesx || '',
          productDetail: unitSort,
        });
      }
    }
    return dataInner;
  }
  /** 有赞商品导入数据处理 */
  public async importyzToDB(arrData: Array<any>): Promise<ProductNewType[]> {
    const fileDataLength = arrData.length;
    if (fileDataLength < 1) {
      return [];
    }
    const arrData0 = arrData[0];
    // 找到对应的下标
    const codeIndex = findIndex(arrData0, '商品编码');
    const barCodeIndex = findIndex(arrData0, '商品条码');
    const unitIndex = findIndex(arrData0, '库存单位');
    const guigeIndex = findIndex(arrData0, '规格项1');
    const nameIndex = findIndex(arrData0, '商品名称');

    const dataInner: Array<ProductNewType> = [];
    const dataInnerObj: Record<string, any> = {};
    // 取规格1作为单位，如果都为空，则去库存单位项
    for (let k = 1; k < fileDataLength; k++) {
      const codeNow = arrData[k][codeIndex];
      const barCodeNow = arrData[k][barCodeIndex];
      const nameNow = arrData[k][nameIndex];
      const unitNow = arrData[k][unitIndex];
      const guigeNow = arrData[k][guigeIndex];

      if (codeNow === 'H02' && guigeNow === '盒') {
        continue;
      }

      if (!dataInnerObj[codeNow] && barCodeNow) {
        const codeNext = arrData[k + 1]?.[codeIndex];

        const thisUni = guigeNow || unitNow;
        const productDetail = [{
          yzunit: thisUni,
        }];
        if (codeNext === codeNow && codeNext) {
          const guigeNext = arrData[k + 1]?.[guigeIndex];

          if (guigeNext && guigeNext !== guigeNow) {
            productDetail.push({
              yzunit: guigeNext,
            });
          }
        }

        dataInnerObj[codeNow] = true;
        dataInner.push({
          code: codeNow,
          barCode: barCodeNow,
          productDetail,
          yzName: nameNow || '',
        });
      }
    }
    return dataInner;
  }
  /** 导入有赞价格 */
  public async importyzPriceToDB(arrData: Array<any>) {
    const fileDataLength = arrData.length;
    if (fileDataLength < 1) {
      return [];
    }
    const arrData0 = arrData[0];
    // 找到对应的下标
    const codeIndex = findIndex(arrData0, '商品编码');
    const guigeIndex = findIndex(arrData0, '规格项1');
    const priceIndex = findIndex(arrData0, '网店价格');

    const dataInnerObj: Record<string, any> = {};

    for (let k = 1; k < fileDataLength; k++) {
      const codeNow = arrData[k][codeIndex];
      const guigeNow = arrData[k][guigeIndex];
      const priceNow = Number(arrData[k][priceIndex]) || 0;
      if (!dataInnerObj[codeNow]) {
        dataInnerObj[codeNow] = {};
      }
      dataInnerObj[codeNow][guigeNow] = priceNow;
    }
    return dataInnerObj;
  }

  /** 导入管家婆价格及商品 */
  public async importgjPriceToDB(arrData: Array<any>) {
    const fileDataLength = arrData.length;
    if (fileDataLength < 3) {
      return [];
    }
    const arrData0 = arrData[3];
    // 找到对应的下标
    const codeIndex = findIndex(arrData0, '商品编号');
    const retailPriceIndex = findIndex(arrData0, '农贸生鲜');// 对应南佐配送
    const wholesalePriceIndex = findIndex(arrData0, '二批价格');// 对应A96
    const restaurantPriceIndex = findIndex(arrData0, '餐饮价格'); // 对应南佐餐饮
    const meteringIndex = findIndex(arrData0, '计量单位');
    const nameIndex = findIndex(arrData0, '商品全名');
    const gegeIndex = findIndex(arrData0, '辅助单位');


    const dataInnerArr: ProductNewType[] = [];
    const dataInnerObj: Record<string, boolean> = {};


    for (let k = 4; k < fileDataLength; k++) {
      const codeNow = arrData[k][codeIndex];
      const meteringNow = arrData[k][meteringIndex];
      const retailPriceNow = arrData[k][retailPriceIndex];
      const wholesalePriceNow = arrData[k][wholesalePriceIndex];
      const restaurantPriceNow = arrData[k][restaurantPriceIndex];
      const nameNow = arrData[k][nameIndex];
      const gegeNow = arrData[k][gegeIndex];
      if (!dataInnerObj[codeNow]) {
        dataInnerObj[codeNow] = true;
        const nextCode = arrData[k + 1]?.[codeIndex];
        const nextMetering = arrData[k + 1]?.[meteringIndex];
        const productDetail: ProductDetailType[] = [
          {
            code: codeNow,
            gjretailPrice: Number(retailPriceNow) || 0,
            gjwholesPrice: Number(wholesalePriceNow) || 0,
            gjrestPrice: Number(restaurantPriceNow) || 0,
            gjunit: meteringNow,
          },
        ];
        if (nextCode === codeNow && nextMetering) {
          const retailPriceNext = arrData[k + 1]?.[retailPriceIndex];
          const wholesalePriceNext = arrData[k + 1]?.[wholesalePriceIndex];
          const restaurantPriceNext = arrData[k + 1]?.[restaurantPriceIndex];
          productDetail.push({
            code: codeNow,
            gjretailPrice: Number(retailPriceNext) || 0,
            gjwholesPrice: Number(wholesalePriceNext) || 0,
            gjrestPrice: Number(restaurantPriceNext) || 0,
            gjunit: nextMetering,
          });
        }
        dataInnerArr.push({
          code: codeNow,
          gjname: nameNow,
          gjspecifications: gegeNow,
          productDetail,
        });
      }
    }
    return dataInnerArr;
  }
  /**  商品编码（管家婆）	商品条码（有赞）
         * 食享商品名称	有赞商品名称	管家婆商品全名
         * 食享规格	管家婆规格
         *
         * 单位（食享）	单位（有赞）	管家婆对应单位
         * 管家婆农贸生鲜价格	管家婆二批价格	管家婆餐饮价格	有赞南佐配送价格	有赞餐饮价格	有赞A96价格
        */
  /** 导出的商品重新全部导入数据整理 */
  public async importNewAllfromSelfSore(arrData: Array<any>) {
    const fileDataLength = arrData.length;

    if (fileDataLength < 1) {
      return [];
    }

    const dataInnerArr: ProductNewType[] = [];
    const dataInnerObj: Record<string, boolean> = {};

    const arrData0 = arrData[0];
    const codeGjIndex = findIndex(arrData0, '商品编码（管家婆）');
    const barCodeIndex = findIndex(arrData0, '商品条码（有赞）');
    const nameSxIndex = findIndex(arrData0, '食享商品名称');
    const nameYzIndex = findIndex(arrData0, '有赞商品名称');
    const nameGjIndex = findIndex(arrData0, '管家婆商品全名');
    const guigeSxIndex = findIndex(arrData0, '食享规格');
    const guigeGjIndex = findIndex(arrData0, '管家婆辅助单位');

    const unitSxIndex = findIndex(arrData0, '单位（食享）');
    const unitYzIndex = findIndex(arrData0, '单位（有赞）');
    const unitGjIndex = findIndex(arrData0, '管家婆对应单位');
    const retailPriceGjIndex = findIndex(arrData0, '管家婆农贸生鲜价格');
    const wholesalePriceGjIndex = findIndex(arrData0, '管家婆二批价格');
    const restaurantGjIndex = findIndex(arrData0, '管家婆餐饮价格');
    const retailPriceYzIndex = findIndex(arrData0, '有赞南佐配送价格');
    const restaurantYzIndex = findIndex(arrData0, '有赞餐饮价格');
    const wholesaPriceYzIndex = findIndex(arrData0, '有赞A96价格');// 对应南佐配送
    for (let k = 1; k < fileDataLength; k++) {
      const codeGjNow = arrData[k][codeGjIndex];
      const barCodeNow = arrData[k][barCodeIndex];
      const nameSxNow = arrData[k][nameSxIndex];
      const nameYzNow = arrData[k][nameYzIndex];
      const nameGjNow = arrData[k][nameGjIndex];
      const guigeSxNow = arrData[k][guigeSxIndex];
      const guigeGjNow = arrData[k][guigeGjIndex];

      const unitSxNow = arrData[k][unitSxIndex];
      const unitYzNow = arrData[k][unitYzIndex];
      const unitGjNow = arrData[k][unitGjIndex];
      const retailPriceGjNow = arrData[k][retailPriceGjIndex];
      const wholesalePriceGjNow = arrData[k][wholesalePriceGjIndex];
      const restaurantGjNow = arrData[k][restaurantGjIndex];
      const retailPriceYzNow = arrData[k][retailPriceYzIndex];
      const restaurantYzNow = arrData[k][restaurantYzIndex];
      const wholesaPriceYzNow = arrData[k][wholesaPriceYzIndex];
      if (!dataInnerObj[codeGjNow] && nameGjNow) {
        dataInnerObj[codeGjNow] = true;

        const productDetail: ProductDetailType[] = unitGjNow ? [
          {
            code: codeGjNow,
            gjretailPrice: Number(retailPriceGjNow) || 0,
            gjwholesPrice: Number(wholesalePriceGjNow) || 0,
            gjrestPrice: Number(restaurantGjNow) || 0,
            yzrestPrice: Number(restaurantYzNow) || 0,
            yzretailPrice: Number(retailPriceYzNow) || 0,
            yzwholesPrice: Number(wholesaPriceYzNow) || 0,
            gjunit: unitGjNow,
            yzunit: unitYzNow,
            sxunit: unitSxNow,
          },
        ] : [];
        const nextCode = arrData[k + 1]?.[codeGjIndex];
        if (nextCode === codeGjNow) {
          const unitSxNext = arrData[k + 1]?.[unitSxIndex];
          const unitYzNext = arrData[k + 1]?.[unitYzIndex];
          const unitGjNext = arrData[k + 1]?.[unitGjIndex];
          const retailPriceGjNext = arrData[k + 1]?.[retailPriceGjIndex];
          const wholesalePriceGjNext = arrData[k + 1]?.[wholesalePriceGjIndex];
          const restaurantGjNext = arrData[k + 1]?.[restaurantGjIndex];
          const retailPriceYzNext = arrData[k + 1]?.[retailPriceYzIndex];
          const restaurantYzNext = arrData[k + 1]?.[restaurantYzIndex];
          const wholesaPriceYzNext = arrData[k + 1]?.[wholesaPriceYzIndex];
          unitGjNext && productDetail.push({
            code: codeGjNow,
            gjretailPrice: Number(retailPriceGjNext) || 0,
            gjwholesPrice: Number(wholesalePriceGjNext) || 0,
            gjrestPrice: Number(restaurantGjNext) || 0,
            yzrestPrice: Number(restaurantYzNext) || 0,
            yzretailPrice: Number(retailPriceYzNext) || 0,
            yzwholesPrice: Number(wholesaPriceYzNext) || 0,
            gjunit: unitGjNext,
            yzunit: unitYzNext,
            sxunit: unitSxNext,
          });
        }
        dataInnerArr.push({
          code: codeGjNow,
          barCode: barCodeNow,
          gjname: nameGjNow,
          sxName: nameSxNow,
          yzName: nameYzNow,
          gjspecifications: guigeGjNow,
          sxspecifications: guigeSxNow,
          productDetail,
        });
      }
    }
    return dataInnerArr;
  }

}

