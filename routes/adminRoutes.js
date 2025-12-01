const express= require("express");
const router = express.Router();

const adminController = require("../controllers/admin-controller");
const isAdmin = require("../middleware/is-admin");

router.post("/login",adminController.postAdminLogin);

router.get("/panel",isAdmin, adminController.getAdminPanel);

// For QR code:
router.post("/qrcode",isAdmin, adminController.generateQrCode);
router.get("/qrcode",isAdmin, adminController.getQrCodePage);
router.get("/qrurl/id/:id",isAdmin, adminController.getQrUrlById);
// VIEW RECORD:
router.get("/attendancerecord",isAdmin, adminController.getAttendanceRecordPage);
router.get("/attendancerecord/data",isAdmin, adminController.viewAttendance);
module.exports = router;