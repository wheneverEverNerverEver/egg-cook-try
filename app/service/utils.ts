/* eslint-disable space-before-function-paren */
/* eslint-disable indent */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable prefer-promise-reject-errors */
import { Service } from 'egg';
import fs = require('mz/fs');
import qiniu = require('qiniu');

const imageUrl = 'img.canoetrunk.site'; // 空间绑定的域名
const bucket = 'nanzuo';
const accessKey = '2eUpLnu50VIEKRAorofvVcTtcg1waTQ8Uj-1XlJo';
const secretKey = 'uNL_mE8X_520mwaJ2W2gWIQidKO20Xk5MsxsX476';

const options = {
    scope: bucket,
    expires: 7200,
};

const uptoken = () => {
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    const token = putPolicy.uploadToken(mac);
    return token;
};

const config = new qiniu.conf.Config();


export default class UploadCustum extends Service {

    public async uploadsGit() {
        const { ctx } = this;
        const uploadToken = uptoken();
        const config = new qiniu.conf.Config();
        const formUploader = new qiniu.form_up.FormUploader(config);
        const putExtra = new qiniu.form_up.PutExtra();

        let imgSrc;
        for (const file of ctx.request.files) {
            const fileName = file.filename;
            const filePath = file.filepath;
            console.log('filename: ' + fileName);
            console.log('tmp filepath: ' + filePath);
            try {
                // 处理文件
                imgSrc = await new Promise((resolve, reject) => {
                    formUploader.putFile(uploadToken, fileName + Date.now(), file.filepath, putExtra, function (respErr,
                        respBody, respInfo) {
                        if (respErr) {
                            console.log('=====>>>respErruploadsGit', respErr);
                            reject(false);
                        }

                        if (respInfo?.statusCode === 200) {
                            console.log(respBody);
                            resolve(respBody);
                        } else {
                            console.log(respInfo.statusCode);
                            console.log(respBody);
                            reject(false);
                        }
                    });

                });
            } finally {
                // 需要删除临时文件
                await fs.unlink(file.filepath);
            }
        }


        return imgSrc;
    }
    public async deleteFile(key?: string) {
        if (!key) return false;
        const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
        (config as any).zone = qiniu.zone.Zone_z2;
        const bucketManager = new qiniu.rs.BucketManager(mac, config);

        const deleteBack = await new Promise((resolve, reject) => {
            bucketManager.delete(bucket, key, function (err, respBody, respInfo) {
                if (err) {
                    reject(false);
                    console.log(err);
                } else {
                    console.log(respInfo.statusCode);
                    console.log(respBody);
                    resolve(respBody);
                }
            });
        });
        return deleteBack;
    }

    public async getCloundImg(filename: string) {
        const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
        const config = new qiniu.conf.Config();
        const bucketManager = new qiniu.rs.BucketManager(mac, config);
        const deadline = parseInt(Date.now() / 1000 as any) + 3600;
        const commHref = `https://${imageUrl}`;
        const privateDownloadUrl = bucketManager.privateDownloadUrl(commHref, filename, deadline);
        const Sign = qiniu.util.hmacSha1(privateDownloadUrl, secretKey);
        const EncodedSign = qiniu.util.urlsafeBase64Encode(Sign);
        return `${privateDownloadUrl}&token=${accessKey}:${EncodedSign}`;
    }
}
