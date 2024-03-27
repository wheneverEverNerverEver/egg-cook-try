// This file is created by egg-ts-helper@1.26.0
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAftermarket from '../../../app/model/aftermarket';
import ExportBill from '../../../app/model/bill';
import ExportCustomer from '../../../app/model/customer';
import ExportDepartment from '../../../app/model/department';
import ExportManager from '../../../app/model/manager';
import ExportPage from '../../../app/model/page';
import ExportProductDetail from '../../../app/model/productDetail';
import ExportProductNew from '../../../app/model/productNew';
import ExportRecordo from '../../../app/model/recordo';
import ExportRole from '../../../app/model/role';
import ExportUser from '../../../app/model/user';

declare module 'egg' {
  interface IModel {
    Aftermarket: ReturnType<typeof ExportAftermarket>;
    Bill: ReturnType<typeof ExportBill>;
    Customer: ReturnType<typeof ExportCustomer>;
    Department: ReturnType<typeof ExportDepartment>;
    Manager: ReturnType<typeof ExportManager>;
    Page: ReturnType<typeof ExportPage>;
    ProductDetail: ReturnType<typeof ExportProductDetail>;
    ProductNew: ReturnType<typeof ExportProductNew>;
    Recordo: ReturnType<typeof ExportRecordo>;
    Role: ReturnType<typeof ExportRole>;
    User: ReturnType<typeof ExportUser>;
  }
}
