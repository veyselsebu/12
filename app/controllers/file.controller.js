const uploadFolder = __basedir + '/uploads/';
const fs = require('fs');
const {google} = require("googleapis");
const sampleClient = require("./sampleclient");
const server = require("../../server");
const readline = require("readline");
//const path = require('path');
var opn = require('opn');

const drive = google.drive({
    version: "v3",
    auth: sampleClient.oAuth2Client
});

module.exports = {
    uploadFile,
    listUrlFiles,
    downloadFile,
    uploadJson,
    exportJsonDrive,
    client: sampleClient.oAuth2Client
}

async function calistir(filePath, res) {
    let sonuc;
    const scopes = ["https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/drive.metadata.readonly"];
    sampleClient
        .authenticate(scopes)
        .then(async () => {
            sonuc = await driveUpload(filePath);
            res.json(sonuc);
            return sonuc;
        })
        .catch(console.error);
    return 'deneme';

}

function reqMimeTypeValue(format) {
    if (format === "doc" || format === "odt" || format === "odp" || format === "ods" || format === "docx") {
        return 'application/vnd.google-apps.document';
    }
    if (format === "xls" || format === "xlsx") {
        return 'application/vnd.google-apps.spreadsheet';
    }
    if (format === "ppt" || format === "pptx") {
        return 'application/vnd.google-apps.presentation';
    }
    return 'application/vnd.google-apps.document';
}

function medMimeTypeValue(format) {
    if (format === "odt") {
        return "application/vnd.oasis.opendocument.text";
    }
    if (format === "ods") {
        return "application/x-vnd.oasis.opendocument.spreadsheet";
    }
    if (format === "odp") {
        return "application/vnd.oasis.opendocument.presentation";
    }
    if (format === "xls" || format === "xlsx") {
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }
    if (format === "ppt" || format === "pptx") {
        return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    }

    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}

function exportMimeTypeValue(format){
    if (format === "odt") {
        return "application/vnd.oasis.opendocument.text";
    }
    if (format === "ods") {
        return "application/x-vnd.oasis.opendocument.spreadsheet";
    }
    if (format === "odp") {
        return "application/vnd.oasis.opendocument.presentation";
    }
    if (format === "xls" || format === "xlsx") {
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }
    if (format === "ppt" || format === "pptx") {
        return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    }
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}

async function driveUpload(filePath) {

    const fileSize = fs.statSync(filePath).size;
    dizi = filePath.split("/");
    const fileName = dizi[dizi.length - 1];
    noktaListesi = fileName.split(".");
    format = noktaListesi[noktaListesi.length - 1];
    const reqMimeType = reqMimeTypeValue(format);
    const medMimeType = medMimeTypeValue(format);

    const res = await drive.files.create(
        {
            requestBody: {
                mimeType: reqMimeType,
                name: fileName
            },
            fields: "*",
            media: {
                body: fs.createReadStream(filePath),
                mimeType: medMimeType

            }
        },
        {
            onUploadProgress: evt => {
                const progress = (evt.bytesRead / fileSize) * 100;
                readline.clearLine();
                readline.cursorTo(0);
                process.stdout.write(`${Math.round(progress)}% complete`);
            }
        }
    );
    //console.log(res.data);
    // console.log(res.data.webViewLink);
    // opn(res.data.webViewLink);
    return await res.data;
}

function exportDrive(fileId, filePath){
    return new Promise(async (resolve, reject) => {
        // const dest = fs.createWriteStream(`${'C:/Users/buse/Desktop'}/olduuuuuuuuuuuuuuuuuuuuuuuuuuuuuu.docx`);
        const dest = fs.createWriteStream(filePath);
        dizi = filePath.split("/");
        const fileName = dizi[dizi.length - 1];
        noktaListesi = fileName.split(".");
        format = noktaListesi[noktaListesi.length - 1];
        const mime= exportMimeTypeValue(format);
        const res = await drive.files.export(
            {
                fileId,
                 mimeType:mime
              //Google Docs

            },
            {

                responseType: "stream",
                encoding: null
            }
        );

        res.data
            .on("end", () => {
                console.log("Done downloading document.");
                const res2 = drive.files.delete(
                    {
                        fileId,
                    },
                    {
                        responseType: "stream",
                        encoding: null
                    }
                );
                try {
                    console.log("simdilik burda");
                    resolve();
                } catch (er) {
                    console.log("errorrrrrrrrrrrrr" + er);
                }
            })
            .on("error", err => {
                console.error("Error downloading document.");
                reject(err);
            })
            .pipe(dest);


    });
}
/*
function exportRun(fileId,filePath){
    const scopes = [
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/drive.metadata.readonly"
    ];
    sampleClient
        .authenticate(scopes)
        .then(exportDrive(fileId,filePath))
        .catch(console.error);

}
*/
async function uploadFile(req, res) {
    sonuc = await calistir(req.file.path.toString(), res);
}

function listUrlFiles(req, res) {
    fs.readdir(uploadFolder, (err, files) => {
        for (let i = 0; i < files.length; ++i) {
            files[i] = "http://localhost:8000/api/file/" + files[i];
        }

        res.send(files);
    })
}

function downloadFile(req, res) {
    let filename = req.params.filename;
    res.download(uploadFolder + filename);
}

function deleteFile(req, res) {

    let filename = req.params.filename;
    fs.unlink(uploadFolder + filename, (err) => {
        if (err) {
            console.log("failed to delete local image:" + err);
        } else {
            console.log('successfully deleted local image');
        }
    });

}

async function uploadJson(req, res) {
    console.log("buraya geldi");
    let model = req.body;
    console.log(model.path+"veysel");
    sonuc = await calistir(model.path, res)
}
function exportJsonDrive(req,res){
    let model = req.body;
    sonuc =  exportDrive(model.id,model.path);
    res.send("success");
}


