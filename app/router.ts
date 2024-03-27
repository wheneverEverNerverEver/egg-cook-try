import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;

  // api
  router.post('/uploadCustum', controller.home.uploadCustum); // 排序、整理客户导入
  router.post('/uploadProduct', controller.home.uploadProduct); // 产品
  router.post('/uploadMuban', controller.home.uploadMuban); // 模板
  router.post('/uploadSalesOrder', controller.home.uploadSalesOrder); // 订单
  router.post(
    '/api/productConstra',
    controller.productConstrct.constrctProductFile,
  ); // 对比

  // router.post('/api/uploadCC',   controller.utils.uploadFiles);// 上传图片

  /** **===========================账户============================>>>>> */
  router.post('/api/login/account', controller.user.login); // 登录
  router.post('/api/logout/account', controller.user.logout); // 登出
  router.get('/api/currentUser', controller.user.currentUser); // 获取用户信息
  router.post('/api/account/add', controller.user.addUser); // 新增
  router.get('/api/account/delete', controller.user.deleteUser); // 删除
  router.post('/api/account/update', controller.user.updateUser); // 编辑
  router.post('/api/account/updateyes', controller.user.changePassWord); // 修改密码
  router.get('/api/account/find', controller.user.findUser); // 查询
  /** **=========-==============================>>>>> */

  /** ========================部门部分------------------------->>>>>>>> */
  router.post(
    '/api/department/import',
    controller.department.importDepartment,
  ); // 导入到数据库中
  router.get(
    '/api/department/delete',
    controller.department.deleteDepartment,
  ); // 删除
  router.get(
    '/api/department/find',
    controller.department.findDepartment,
  ); // 查询
  /** 经手人是否在菜单显示 */
  router.get(
    '/api/department/showIfDic',
    controller.department.changeShowDepartment,
  );
  router.get(
    '/api/department/findshowIfDic',
    controller.department.findShowDepartment,
  ); // 查询所有的数量

  /** =================部门部分 ---------------------------->>>>>*/


  /** **======================客户===========================>>>>> */
  router.post(
    '/api/customer/import',
    controller.customer.importCustomer,
  ); // 导入到数据库中
  router.post(
    '/api/customer/importAll',
    controller.customer.importIndeedCustomer,
  ); // 覆盖式导入到数据库中

  router.get(
    '/api/customer/delete',
    controller.customer.deleteCustomer,
  ); // 删除
  router.post(
    '/api/customer/update',
    controller.customer.updateCustomer,
  ); // 编辑
  // router.post('/api/customer/add',   controller.customer.addCustomer); // 新增
  router.get('/api/customer/find', controller.customer.findCustomer); // 查询
  router.post('/api/customer/transformYZSVC', controller.customer.transformYZSVC); // 转成可导入到有赞的文件
  /** =======================================-==============================>>>>> */


  /** **=============>>> 欠单 <<<<==============================>>>>> */
  router.post('/api/bill/image', controller.bill.billImg);// 上传订单图片
  /** 新增式导入 */
  router.post(
    '/api/bill/import',
    controller.bill.importBill,
  ); // 导入到数据库中
  /** 覆盖式导入*/
  router.post(
    '/api/bill/importSmail',
    controller.bill.importCoverBill,
  ); // 导入到数据库中
  // router.get(
  //   '/api/bill/delete',
  //   controller.bill.deleteBill,
  // ); // 删除
  router.post(
    '/api/bill/update',
    controller.bill.updateBill,
  ); // 编辑
  router.get(
    '/api/bill/download',
    controller.bill.downloadAllBill,
  ); // 下载所有欠单
  router.post('/api/bill/find', controller.bill.findBill); // 查询
  /** **-----------------=========-==============================>>>>> */

  /** **=========-===========权限===================>>>>> */
  /** 覆盖式导入*/
  router.post(
    '/api/role/authImport',
    controller.page.importPage,
  ); // 导入到数据库中
  router.get('/api/role/authfind', controller.page.findPage); // 查询权限
  /** **---------------------------------------------->>>>> */
  /** **=========-==============================>>>>> */


  /** **=========-=========角色=====================>>>>> */
  router.get(
    '/api/role/delete',
    controller.role.deleteRole,
  ); // 删除
  router.post(
    '/api/role/update',
    controller.role.updateRole,
  ); // 编辑
  router.post('/api/role/add', controller.role.addNewRole); // 新增
  router.get('/api/role/find', controller.role.findRole); // 查询
  /** **---------------------------------------------->>>>> */
  router.get('/api/log/find', controller.recordo.findrecordo); // 查询
  /** **=========-==============================>>>>> */

  /** ===============================售后===================================== */
  router.post('/api/after/add', controller.aftermarket.addAftermarket); // 新增
  router.post('/api/after/update', controller.aftermarket.editAftermarket); // 编辑
  router.post('/api/after/delete', controller.aftermarket.deleteAftermarket); // 删除
  router.post('/api/after/find', controller.aftermarket.findAftermarket); // 查询
  router.post('/api/after/image', controller.aftermarket.aftermarketImg);// 上传图片
  /** ==================================================================== */

  /** ============================商品==================================== */

  router.get('/api/v2/product/find', controller.productNew.findProductNew); // 查询商品
  router.post('/api/v2/product/add', controller.productNew.addProductNew); // 新增商品
  router.get('/api/v2/product/findOne', controller.productNew.findProductNewOne); // 新增商品

  router.get(
    '/api/v2/product/delete',
    controller.productNew.deleteProductNew,
  ); // 删除商品
  router.post(
    '/api/v2/product/update',
    controller.productNew.updateProductNew,
  ); // 编辑商品

  router.get(
    '/api/v2/product/download',
    controller.productNew.downloadNewAll,
  ); // 下载商品
  router.post(
    '/api/v2/product/importslef',
    controller.productNew.importNewAllfromSelf,
  ); // 将下载出的文件格式重新导入数据库中

  router.post(
    '/api/v2/product/importgj',
    controller.productNew.importProductGjPrice,
  ); // 导入管家婆商品及价格到数据库中
  router.post(
    '/api/v2/product/importsx',
    controller.productNew.importSxProduct,
  ); // 导入食享到数据库中
  router.post(
    '/api/v2/product/importyz',
    controller.productNew.importYzProduct,
  ); // 导入有赞总部商品到数据库中
  router.post(
    '/api/v2/product/priceyz',
    controller.productNew.importProductyzPrice,
  ); // 导入有赞价格数据库中

  router.post(
    '/api/product/transformExcelyz',
    controller.productNew.transformProductyz,
  ); // 有赞表格转换
  router.post(
    '/api/product/transformExcel',
    controller.productNew.transformsxProduct,
  ); // 食享表格转换


  /** ==================================================================== */


  // 页面
  router.get('/indexPage', controller.home.indexPage);
  router.get('/indexProduct', controller.home.indexProduct);
  router.get('/indexCompose', controller.home.indexCompose);
  router.get('/', controller.home.index);
};
