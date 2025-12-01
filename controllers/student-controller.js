const bcrypt = require("bcryptjs");
const QRCode = require('qrcode');
const fetch = require('node-fetch');
const geolib = require('geolib');
const sendResponse = require("../utils/responses");
const path = require("path");

const Admin = require("../models/Admin");
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const Courses = require("../models/Courses");
const Classes = require("../models/Classes");

const thresholdDistance = 100000;
const CLASS_DURATION = 1 * 60 * 1000;   // 1 Minute


// Login STUDENT ACCOUNT:
exports.postStudentLogin = async (req, res) => {
  const { admissionNo, password } = req.body;
  delete req.session.error;
  let student = await Student.findOne({ AdmissionNo: admissionNo });

  if (!student) {
    req.session.error = "Student not registered!"
    return sendResponse.notFound(res, "Student not registered!");
  };

  const isMatch = await bcrypt.compare(password, student.password);

  if (!isMatch) {
    req.session.error = "Invalid credential!";
    return sendResponse.notAuthorized(res, "Invalid credential!");
  };

  req.session.isStudent = true;
  req.session.profile = {
    admissionNo,
    name: student.name,
    program: student.program,
    section: student.section,
  };

  return sendResponse.ok(res, "Login Successful", { student });
};

exports.getStudentDashboard = async (req, res) => {
  return res.sendFile(path.join(__dirname, "..", "public", "views", "studentDashboard.html"));
}

exports.getStudentData = async (req, res) => {
  const profile = req.session.profile;

  let courses = await Courses.find({ program: profile.program }, { _id: 0 });
  let attendance = {};
  let totalClasses = {};
  for (let course of courses) {
    let courseId = course.courseId;
    let presentDates = await Attendance.findOne({ AdmissionNo: profile.admissionNo, course_id: courseId }, { presentDates: 1, _id: 0 });
    attendance[courseId] = presentDates ? presentDates.presentDates.length : 0;
    let classCount = await Classes.count({ program: profile.program, section: profile.section, course_id: courseId });
    totalClasses[courseId] = classCount;
  }

  return sendResponse.ok(res, "Student Data fetched", { profile, courses, attendance, totalClasses });
};

// Update Attendance:
exports.markAttendance = async (req, res) => {
  const admissionNo = req.session.profile.admissionNo;
  const userSection = req.session.profile.section;
  const userProgram = req.session.profile.program;
  const { course_id, section, program, timeStamp, qrLatitude, qrLongitude } = req.query;
  const { latitudeInput, longitudeInput } = req.body;
 


  const distance = geolib.getDistance(
    { latitude: qrLatitude, longitude: qrLongitude },
    { latitude: latitudeInput, longitude: longitudeInput }
  );
  console.log(`distance ${distance}`);

  if (userProgram !== program) {
    req.session.error = "QR is not for your program!";
    return sendResponse.badRequest(res, "QR is not for your program!");
  };

  if (userSection !== section) {
    req.session.error = "Section doesn't match!";
    return sendResponse.badRequest(res, "Section doesn't match!");
  };

  let totalClasses = await Classes.count({ program, section, course_id });
  let previousAttendance = await Attendance.findOne({ AdmissionNo: admissionNo, course_id }, { presentDates: 1, _id: 0 });


  if (!totalClasses) {
    req.session.error = "Attendance Overloaded!";
    return sendResponse.badRequest(res, "Attendance Overloaded!");
  }

  if (distance > thresholdDistance) {
    req.session.error = "Not present near the QR code/Class";
    return sendResponse.badRequest(res, "Not present near the QR code/Class");
  }

  if (previousAttendance) {
    let previousAttendanceDates = previousAttendance.presentDates;
    let lastPresent = previousAttendanceDates[previousAttendanceDates.length - 1];


    if (new Date() - lastPresent < CLASS_DURATION || (new Date()).getTime() - timeStamp > CLASS_DURATION) {
      req.session.error = "QR INVALID!.";
      return sendResponse.badRequest(res, "QR INVALID!.");
    }

    await Attendance.updateOne({ AdmissionNo: admissionNo, course_id: course_id }, { $push: { presentDates: new Date() } });
  }

  if (!previousAttendance) {
    let attendance = new Attendance({
      AdmissionNo: admissionNo,
      course_id: course_id,
      presentDates: [new Date()]
    })

    await attendance.save();
  }

  delete req.session.error;
  return sendResponse.ok(res, "Attendance marked successfully");
};