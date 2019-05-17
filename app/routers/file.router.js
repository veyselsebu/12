let express = require('express');
let router = express.Router();
let upload = require('../config/multer.config.js');

let fileWorker = require('../controllers/file.controller.js');

router.post('/api/file/upload', upload.single("file"), fileWorker.uploadFile);

router.get('/api/file/all', fileWorker.listUrlFiles);

router.get('/api/file/:filename', fileWorker.downloadFile);

router.post('/api/json/upload',fileWorker.uploadJson);
router.post('/api/json/exportDrive',fileWorker.exportJsonDrive);

module.exports = router;
