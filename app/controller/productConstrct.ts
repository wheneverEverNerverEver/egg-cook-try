
import { Controller } from 'egg';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

export default class ProductConstrctController extends Controller {
  public async constrctProductFile() {
    const { ctx } = this;
    const fileOut: any[] = await ctx.service.uploadCustum.fileTurnToworsheet();

    if (fileOut.length > 0) {
      // 对比数据
      const filnalJson: Record<any, any> =
        (await ctx.service.productCon.constrctEach(
          JSON.parse(fileOut[0])?.['库存状况表'],
        )) || { };

      await ctx.service.uploadCustum.fileOutput(
        path.join('app', 'public', 'constra', 'fail.txt'),
        JSON.stringify(filnalJson.fail),
      );
      await ctx.service.uploadCustum.fileOutput(
        path.join('app', 'public', 'constra', 'success.txt'),
        JSON.stringify(filnalJson.success),
      );

      ctx.body = filnalJson;
    } else {
      ctx.body = { error: true };
    }
  }
}
