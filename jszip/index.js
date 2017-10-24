import JSZip from 'jszip';
import JSZipUtils from './jsZip_util.js';

export default async function loadZip(url) {
    let data = await new Promise(function (rs, rj) {
        JSZipUtils.getBinaryContent(url, function (err, result) {
            if (err) {
                throw err;
            }
            rs(result);
        });
    });

    let zip = await JSZip.loadAsync(data);

    let imageData = [];

    let re = /(.jpg|.png|.gif|.ps|.jpeg)$/;
    let result = await Promise.all(
        Object.keys(zip.files)
            .filter(fileName => re.test(fileName.toLowerCase()))
            .map(async function (fileName) {
                let file = zip.files[fileName];
                let blob = await file.async('blob');

                return [
                    fileName,  // keep the link between the file name and the content
                    blob // create an url. img.src = URL.createObjectURL(...) will work
                ];
            })
    );

    let imageData = result.reduce(function (acc, val) {
        let key = val[0].replace(/^\d+_WEB\//, '').replace('.png', '');
        acc[key - 1] = URL.createObjectURL(val[1]);
        return acc;
    }, []);

    return imageData;

}