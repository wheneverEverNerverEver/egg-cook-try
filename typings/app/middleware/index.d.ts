// This file is created by egg-ts-helper@1.26.0
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportCheckIfHadRight from '../../../app/middleware/checkIfHadRight';
import ExportCheckIfLogin from '../../../app/middleware/checkIfLogin';

declare module 'egg' {
  interface IMiddleware {
    checkIfHadRight: typeof ExportCheckIfHadRight;
    checkIfLogin: typeof ExportCheckIfLogin;
  }
}
