// This file is created by egg-ts-helper@1.26.0
// Do not modify this file!!!!!!!!!

import 'egg';
type AnyClass = new (...args: any[]) => any;
type AnyFunc<T = any> = (...args: any[]) => T;
type CanExportFunc = AnyFunc<Promise<any>> | AnyFunc<IterableIterator<any>>;
type AutoInstanceType<T, U = T extends CanExportFunc ? T : T extends AnyFunc ? ReturnType<T> : T> = U extends AnyClass ? InstanceType<U> : U;
import ExportProductCon from '../../../app/service/ProductCon';
import ExportSortSxExcel from '../../../app/service/SortSxExcel';
import ExportTest from '../../../app/service/Test';
import ExportUploadCustum from '../../../app/service/UploadCustum';
import ExportBaseAftermarketOperate from '../../../app/service/baseAftermarketOperate';
import ExportBaseBillOperate from '../../../app/service/baseBillOperate';
import ExportBaseCustomerOperate from '../../../app/service/baseCustomerOperate';
import ExportBaseDepartmentOperate from '../../../app/service/baseDepartmentOperate';
import ExportBaseManagerOperate from '../../../app/service/baseManagerOperate';
import ExportBasePageOperate from '../../../app/service/basePageOperate';
import ExportBaseProductNewOperate from '../../../app/service/baseProductNewOperate';
import ExportBaseRecordoOperate from '../../../app/service/baseRecordoOperate';
import ExportBaseRoleOperate from '../../../app/service/baseRoleOperate';
import ExportBaseUserOperate from '../../../app/service/baseUserOperate';
import ExportBaseop from '../../../app/service/baseop';
import ExportUtils from '../../../app/service/utils';

declare module 'egg' {
  interface IService {
    productCon: AutoInstanceType<typeof ExportProductCon>;
    sortSxExcel: AutoInstanceType<typeof ExportSortSxExcel>;
    test: AutoInstanceType<typeof ExportTest>;
    uploadCustum: AutoInstanceType<typeof ExportUploadCustum>;
    baseAftermarketOperate: AutoInstanceType<typeof ExportBaseAftermarketOperate>;
    baseBillOperate: AutoInstanceType<typeof ExportBaseBillOperate>;
    baseCustomerOperate: AutoInstanceType<typeof ExportBaseCustomerOperate>;
    baseDepartmentOperate: AutoInstanceType<typeof ExportBaseDepartmentOperate>;
    baseManagerOperate: AutoInstanceType<typeof ExportBaseManagerOperate>;
    basePageOperate: AutoInstanceType<typeof ExportBasePageOperate>;
    baseProductNewOperate: AutoInstanceType<typeof ExportBaseProductNewOperate>;
    baseRecordoOperate: AutoInstanceType<typeof ExportBaseRecordoOperate>;
    baseRoleOperate: AutoInstanceType<typeof ExportBaseRoleOperate>;
    baseUserOperate: AutoInstanceType<typeof ExportBaseUserOperate>;
    baseop: AutoInstanceType<typeof ExportBaseop>;
    utils: AutoInstanceType<typeof ExportUtils>;
  }
}
