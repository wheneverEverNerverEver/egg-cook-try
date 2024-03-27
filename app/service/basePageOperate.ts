import { Service } from 'egg';
import { changeSpecialCharacter, findIndex } from '../commonJs';
import { PageType } from '../commonJs/type';

/**
 * 页面的基本增删改查
 */
export default class basePageOperate extends Service {
  /**
   * 新增
   */
  public async insertPage(pageObj: PageType) {
    const { ctx } = this;
    try {
      const pageFind = await ctx.model.Page.insertMany([{ ...pageObj }]);
      return pageFind;
    } catch (error) {
      console.error('======>>>>>>insertPage error', error);
      return false;
    }
  }

  /**
   * 删除
   */
  public async deletePage(id: string) {
    const { ctx } = this;
    try {
      await ctx.model.Page.deleteOne({
        _id: id,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
  /**
  * 导入
  */
  public async importPage(arrData) {
    const fileDataLength = arrData.length;
    if (fileDataLength < 1) {
      return [];
    }
    const arrData0 = arrData[0];
    // 找到对应的下标 操作码	操作名称	操作链接	是否为子元素	上级
    const codeIdSx = findIndex(arrData0, '操作码');
    const deName = findIndex(arrData0, '操作名称');
    const linkDe = findIndex(arrData0, '操作链接');
    const levelDe = findIndex(arrData0, '是否为子元素');
    const parentDe = findIndex(arrData0, '上级');

    const dataInner: Array<PageType> = [];

    for (let k = 1; k < fileDataLength; k++) {
      const nowCode = arrData[k][codeIdSx];
      const nowname = arrData[k][deName];
      const nowLink = arrData[k][linkDe];
      const nowLevel = Number.parseInt(arrData[k][levelDe]) || 0;
      const nowParent = arrData[k][parentDe];
      if (nowname && nowCode) {
        dataInner.push({
          url: nowLink,
          pageCode: nowCode,
          pageName: nowname,
          level: nowLevel,
          parentCode: nowParent,
        });
      }
    }
    return dataInner;
  }
  // async gotTree(level?: number, arr?: PageType[]) {
  //   const { ctx } = this;

  //   let data: PageType[];
  //   if (level === undefined) {
  //     data = await ctx.model.Page.find().sort('level').limit(1);
  //   } else {
  //     data = await ctx.model.Page.find({ level });

  //   }
  //   if (data?.length > 0) {

  //   } else {
  //     return
  //   }

  // }
  public async searchPage() {
    const { ctx } = this;

    try {
      const data: PageType[] = await ctx.model.Page.find({ level: 0 });

      const treeData = await Promise.all(data.map(async item => {
        const value = item.pageCode;
        const children: PageType[] = await ctx.model.Page.find({ parentCode: changeSpecialCharacter(value) });
        const childrenFia = children.map(v => ({
          key: v.pageCode,
          value: v.pageCode,
          title: v.pageName,
        }));
        return {
          value,
          key: value,
          title: item.pageName,
          children: childrenFia,
        };
      }));
      return treeData;
    } catch (error) {
      console.log('======>>>>>>error searchPage', error);
      return false;
    }
  }
}
