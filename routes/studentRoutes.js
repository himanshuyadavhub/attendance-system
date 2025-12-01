const express= require("express");
const router = express.Router();

const studentController = require("../controllers/student-controller");
const isStudent = require("../middleware/is-student");

// STUDENT ACCOUNT DASHBOARD AND LOGIN:
router.post("/login",studentController.postStudentLogin);
router.get("/dashboard",isStudent,studentController.getStudentDashboard);
router.get("/studentData",isStudent,studentController.getStudentData);

// UPDATE ATTENDANCE RECORD:
router.post("/updating",isStudent,studentController.markAttendance);


module.exports = router;