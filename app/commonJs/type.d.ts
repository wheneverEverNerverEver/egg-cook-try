export type ArrayD = Array<any>;


export type DiscountDetail = {
  // 活动立减
  activityReduction: number;
  // 运费
  freight: number;
  // 总优惠（包含立减）
  totalDiscount: number;
  // 实付金额
  paidInAmount: number;
  // 配送方式
  distributionMode: string;
};
export type DiscountDetailyz = {
  //收货人取货人姓名
  name?: string
  // 运费
  freight: number;
  // 总优惠（包含立减）
  totalDiscount: number;
  // 总优惠方式（有赞）
  totalDisWay?: string;
  //商品总金额
  productAllPrice?: number;
  //买家备注 (有赞)
  memo?: string
  // 实付金额数组，用于拼接，加上运费
  paidInAmountArr?: string[];
  // 配送方式
  distributionMode: string;
  // 不包含运费的金额（有赞）
  paidInAmount?: number
  // 收货（有赞）
  purchaserPhone: string
  // 是否有退货
  doHaveProductBack?: boolean
  // 注册号码（有赞）
  buyer: string
  //收货人电话和收货地址
  baseDeliver?: string
  //卖家备注
  sellerMemo?: string
  //所属店铺
  belongStore?: string
  //订单状态
  stateOrder?:string
};

export type Manager = {
  name?: string;
  sxCode?: string;
  gjCode: string;
  _id?: string
}
export type UserType = {
  accountName?: string;
  userName?: string;
  password?: string;
  role?: string;
  _id?: string
  roleObj?: RoleType
}

export type TransformRule = {
  departId?: string;
  withStart?: string
  _id?: string
}
export type DepartmentType = {
  code?: string,
  deName?: string,
  label?: string,
  showInMenu?: boolean,
  _id?: string
}
export type CustomerType = {
  code?: string,
  name?: string,
  deadline?: number | string,
  updateTime?: number | string,
  district?: string
  label?: string
  _id?: string,
  label?: string,
  manager?: string,
  oweTotal?: number,
  status?: string
  phone?: string
  trUsed?: number,
}
export enum LabelType { DEPARTENT = 'DEPARTENT', WAREHOUSE = 'WAREHOUSE', DISTRICT = 'DISTRICT', CLASS = 'CLASS', STAFF = 'STAFF', BELONG = 'BELONG' }
export type LabelTypeDic = 'DEPARTENT' | 'DISTRICT' | 'CLASS' | 'STAFF' | 'BELONG' | 'WAREHOUSE'


/** 账期允许范围内欠单 OWE  
 *  超出允许账期范围 SERIOUS_DELAY
 *  已还请 SERIOUS_DELAY
 */
// export enum StatusBill { 3A_OWE = '3_OWE', 4_PAY_OFF = 'PAY_OFF', SERIOUS_DELAY = 'SERIOUS_DELAY', HIGH_DELAY = 'HIGH_DELAY' }
export type StatusBillWord = '3_OWE' | '1_SERIOUS_DELAY' | '2_HIGH_DELAY'


export type CustomerTypeName = {
  code?: string,
  name?: string,
  deadline?: number | string,
  updateTime?: number | string,
  district?: DepartmentType,
  label?: DepartmentType,
  manager?: DepartmentType,
  oweTotal?: number,
  trUsed?: number,
  _id?: string
}

export type BillTypeCode = {
  startTime?: string | number,
  customer?: string,
  endTime?: string | number,
  state?: StatusBillWord, /** 订单状态 */
  amount?: number, /** 金额 */
  orderCode?: string,
  manager?: string, /** 经手人*/
  delivery?: string, /** 配送人*/
  img?: string
  _id?: string
  imgUploader?: string
}

export type BillType = {
  startTime?: string | number,
  customer?: CustomerType,
  endTime?: string | number,
  state?: StatusBillWord, /** 订单状态 */
  amount?: number, /** 金额 */
  orderCode?: string,
  manager?: DepartmentType, /** 经手人*/
  delivery?: DepartmentType, /** 配送人*/
  img?: string,
  _id?: string,
  imgUploader?: string
  startTimeRange?: string[]
}

export type PageType = {
  url?: string,
  pageName?: string,
  pageCode?: string,
  _id?: string,
  level?: number,
  parentCode?: string,
}
export type LogType = {
  operationTime?: string | number,
  operationDetail?: string,
  operator?: string,
  operatorObj?: UserType
  _id?: string,
}
export type RoleType = {
  roleName?: string | number
  pageCode?: string[]
  _id?: string,
  updateTime?: string
  pageCodeArr?: PageType
}

export type ProductyzType = {
  code?: string,
  barCode?: string,
  name?: string,
  _id?: string,
}
export type ProductType = {
  nameSx?: string,
  nameGj?: string,
  code?: string,
  unit?: { unitSx?: string, unitGj?: string }[],
  specifications?: string,
  updateTime?: string,
  _id?: string,
}

export type ProductYzTransform = {
  warehouse?: string,
  department?: string,
  belong?: string,
  //其他路线安排
  otherRouterAndDep?: {
    department?: string;
    router?: string;
  }[]

}
export type AftermarketProcess = 'WAITING' | 'DONE'
export type AftermarketReason = 'NEEDREFUND' | 'NEEDRETURNREFUNF'
export type AftermarketType = {
  startTime?: string,
  customer?: string,
  endTime?: string,
  state?: AftermarketProcess, /** 处理状态 */
  reason?: string, /** 售后原因 */
  orderCode?: string, /** 订单编号 */
  handler?: string, /** 处理人ID*/
  delivery?: string, /** 售后配送员*/
  imgFromCus?: string, /** 售后截图*/
  imgFromWebHref?: string, /** 使用超链接*/
  imgRefund?: string, /** 售后退款截图*/
  imgFromCusUploader?: string, /** 售后截图上传人*/
  imgRefundUploader?: string, /** 售后退款截图上传人*/
  reasonType?: AftermarketReason
  _id?: string,
  id?: string,
}

export type AftermarketDetailType = {
  startTime?: string,
  customer?: CustomerType,
  endTime?: string,
  state?: AftermarketProcess, /** 处理状态 */
  reason?: string, /** 售后原因 */
  orderCode?: string, /** 订单编号 */
  handler?: UserType, /** 处理人ID*/
  delivery?: DepartmentType, /** 售后配送员*/
  imgFromCus?: string, /** 售后截图*/
  imgFromCusUploader?: UserType, /** 售后截图上传人*/
  imgRefundUploader?: UserType, /** 售后退款截图上传人*/
  imgFromWebHref?: string, /** 使用超链接*/
  imgRefund?: string, /** 售后退款截图*/
  reasonType?: AftermarketReason
  _id?: string,
}

export type ProductDetailType = {
  code?: string, // 管家婆商品编码
  /** 有赞价格 */
  yzretailPrice?: number, // 有赞零售单位价格
  yzrestPrice?: number, // 有赞餐饮单位价格
  yzwholesPrice?: number, // 有赞批发单位价格
  /** 管家婆价格 */
  gjretailPrice?: number, // 管家婆零售单位价格
  gjrestPrice?: number, // 管家婆餐饮单位价格
  gjwholesPrice?: number, // 管家婆批发单位价格
  /** 单位 */
  yzunit?: string, // 有赞单位
  gjunit?: string, // 管家婆单位
  sxunit?: string, // 食享单位
  productId?: string //产品ID
  _id?: string,
}

export type ProductNewType = {
  productDetail?: ProductDetailType[]//商品参数
  productId?: string, // 对应商品Id
  barCode?: string, // 商品条码
  code?: string, // 商品条码
  gjname?: string, // 商品名称
  sxName?: string, // 食享名称
  yzName?: string, // 有赞名称
  gjspecifications?: string, // 管家婆规格
  yzspecifications?: string, // 有赞规格
  sxspecifications?: string, // 食享名称
  _id?: string,
  updateTime?: number | string,
}
//商品类别
export type ProductTypeDictType = 'youzan.retail' | 'youzan.wholesale' | 'youzan.restaurant' | 'shixiang' | 'youzan' | 'baseWayGj';


