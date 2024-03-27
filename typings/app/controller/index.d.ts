// This file is created by egg-ts-helper@1.26.0
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAftermarket from '../../../app/controller/aftermarket';
import ExportBase from '../../../app/controller/base';
import ExportBill from '../../../app/controller/bill';
import ExportCustomer from '../../../app/controller/customer';
import ExportDepartment from '../../../app/controller/department';
import ExportHome from '../../../app/controller/home';
import ExportManager from '../../../app/controller/manager';
import ExportPage from '../../../app/controller/page';
import ExportProductConstrct from '../../../app/controller/productConstrct';
import ExportProductNew from '../../../app/controller/productNew';
import ExportRecordo from '../../../app/controller/recordo';
import ExportRole from '../../../app/controller/role';
import ExportUser from '../../../app/controller/user';
import ExportUtils from '../../../app/controller/utils';

declare module 'egg' {
  interface IController {
    aftermarket: ExportAftermarket;
    base: ExportBase;
    bill: ExportBill;
    customer: ExportCustomer;
    department: ExportDepartment;
    home: ExportHome;
    manager: ExportManager;
    page: ExportPage;
    productConstrct: ExportProductConstrct;
    productNew: ExportProductNew;
    recordo: ExportRecordo;
    role: ExportRole;
    user: ExportUser;
    utils: ExportUtils;
  }
}
