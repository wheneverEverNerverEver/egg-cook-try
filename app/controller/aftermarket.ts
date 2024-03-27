import { Controller } from 'egg';
import { changeSpecialCharacter } from '../commonJs';
import { AftermarketType } from '../commonJs/type';

export default class AftermarketController extends Controller {
  /** 新增 */
  public async addAftermarket() {
    const { ctx } = this;
    const bodyData: AftermarketType = ctx.request.body;

    try {
      // const dataImage = await ctx.service.utils.uploadsGit();
      // const imageKey = dataImage && dataImage?.key;
      const data = await ctx.service.baseAftermarketOperate.insertAftermarket({
        ...bodyData,
        // imgFromCus: imageKey,
        // imgFromCusUploader: ctx.session.id
      });

      ctx.body = data ? data : { error: true };
    } catch (e) {
      console.error('=====>>>>>addAftermarket error', e);
      ctx.body = { error: true };
    }
  }
  /** 查询 */
  public async findAftermarket() {
    const { ctx } = this;
    const bodyData: AftermarketType = ctx.request.body;
    try {
      const data = await ctx.service.baseAftermarketOperate.searchAftermarket({
        ...bodyData,
      });
      ctx.body = data ? data : { error: true };
    } catch (e) {
      console.error('=====>>>>>findAftermarket error', e);
      ctx.body = { error: true };
    }
  }
  /** 删除 */
  public async deleteAftermarket() {
    const { ctx } = this;
    const search: { id?: string } = ctx.request.body;
    try {
      const data = await ctx.service.baseAftermarketOperate.deleteAftermarket(search?.id);
      ctx.body = data ? { error: false } : { error: true };
    } catch (e) {
      console.error('=====>>>>>deleteAftermarket error', e);
      ctx.body = { error: true };
    }
  }
  /** 编辑 */
  public async editAftermarket() {
    const { ctx } = this;
    const search: any = ctx.request.body;
    try {
      const data = await ctx.service.baseAftermarketOperate.updateAftermarket(search);
      ctx.body = data ? data : { error: true };
    } catch (e) {
      console.error('=====>>>>>editAftermarket error', e);
      ctx.body = { error: true };
    }
  }
  public async aftermarketImg() {
    const { ctx } = this;
    const { id, wordKey }: {
      id?: string,
      wordKey?: 'imgRefund' | 'imgFromCus'
    } = ctx.request.query;

    if (!id || !wordKey) {
      ctx.body = { error: true };
      return false;
    }
    try {
      await ctx.service.baseAftermarketOperate.beforeNeedDeletedImg({ _id: changeSpecialCharacter(id) }, wordKey);
      const data = await ctx.service.utils.uploadsGit();
      if (data && data?.key) {

        await ctx.model.Aftermarket.findOneAndUpdate({ _id: id }, { [wordKey]: data?.key, [`${wordKey}Uploader`]: ctx.session.id });


        ctx.body = { error: false };
      } else {
        ctx.body = { error: true };
      }

    } catch (e) {
      console.error('=====>>>>>>aftermarketImg error', e);
      ctx.body = { error: true };
    }
  }
}
