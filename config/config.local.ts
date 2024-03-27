import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const config: PowerPartial<EggAppConfig> = {};
  const mongoose = {
    client: {
      url: 'mongodb://127.0.0.1:27017/summer', // 你的数据库地址，egg_article是你数据库得名字
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // user: 'maySummerCome',
        // pass: '=Dwl2glOTx~$_JesQ?VTLzku8A@eELEp',
      },
    },
  };
  return {
    ...config,
    mongoose,
  };
};
