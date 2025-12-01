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



exports.postAdminLogin = async (req, res) => {
  const { id, password } = req.body;
  const admin = await Admin.findOne({ Id: id });


  if (!admin) {
    req.session.error = "Invalid Credentials";
    return sendResponse.notFound(res, "No user found with this ID");
  };

  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    req.session.error = "Invalid Credentials";
    return sendResponse.notAuthorized(res, "Invalid Credentials");
  }

  req.session.Id = admin.Id;
  req.session.program = admin.program;
  req.session.isAdmin = true;

  return sendResponse.ok(res, "Login Successful", admin);

};

exports.getAdminPanel = async (req, res) => {
  res.sendFile(path.join(__dirname, "../public/views/adminPanel.html"));
};


// Generate and Save QR:
exports.generateQrCode = async (req, res) => {

  const { courseId, section, timeStamp, location } = req.body;
  const program = req.session.program;
  req.session.courseId = courseId;
  req.session.section = section;

  


  const text = `http://localhost:5000/student/updating?course_id=${courseId}&section=${section}&program=${program}&time=${timeStamp}&qrLatitude=${location.latitude}&qrLongitude=${location.longitude}`;

  // Generate QR code
  QRCode.toDataURL(text, async (err, url) => {
    if (err) {
      return sendResponse.serverError(res, "Error generating QR code");
    } else {
      const newClass = new Classes({
        program,
        course_id: courseId,
        section,
        dateAndTime: timeStamp,
        qrUrl: url
      })
      await newClass.save();
      return sendResponse.ok(res, "QR Code Generated", newClass);
    }
  });
};

exports.getQrCodePage = async (req, res) => {
  res.sendFile(path.join(__dirname, "../public/views/qrcode.html"));
}

exports.getQrUrlById = async (req, res) => {
  const qrId = req.params.id;
  console.log("QR ID", qrId)

  const qrRecord = await Classes.findById(qrId);
  if (!qrRecord) {
    return sendResponse.notFound(res, "QR Code record not found");
  }
  return sendResponse.ok(res, "QR Code record found", qrRecord);
};

// View Attendance:

exports.getAttendanceRecordPage = async (req, res) => {
  res.sendFile(path.join(__dirname, "../public/views/attendanceRecord.html"));
}


exports.viewAttendance = async (req, res) => {
  const { course_id, section } = req.query;
  const program = req.session.program;

  const records = await Student.aggregate([
    {
      $match: { section: section }
    },
    {
      $lookup: {
        from: "attendances",
        let: { admissionNo: "$AdmissionNo" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$AdmissionNo", "$$admissionNo"] },
                  { $eq: ["$course_id", course_id] }
                ]
              }
            }
          }
        ],
        as: "attendanceData"
      }
    },
    {
      $addFields: {
        attendanceCount: {
          $cond: {
            if: { $gt: [{ $size: "$attendanceData" }, 0] },
            then: { $size: { $arrayElemAt: ["$attendanceData.presentDates", 0] } },
            else: 0
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        AdmissionNo: 1,
        name: 1,
        attendanceCount: 1
      }
    }
  ]);

  let totalClasses = await Classes.count({ program, section, course_id });
  return sendResponse.ok(res, "Attendance records fetched", { records, course_id, section, totalClasses });
};