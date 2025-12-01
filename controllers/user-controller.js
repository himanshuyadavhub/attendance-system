const bcrypt = require("bcryptjs");
const QRCode = require('qrcode');
const fetch = require('node-fetch');
const geolib = require('geolib');
const path = require('path');
const sendResponses= require("../utils/responses");

const Admin = require("../models/Admin");
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const Courses = require("../models/Courses");
const Classes = require("../models/Classes");

exports.getRegister = (req, res) => {
  const error = req.session.error;
  delete req.session.error;
  res.sendFile(path.join(__dirname, "../public/views/register.html"));
};

exports.postRegister = async (req, res) => {
  
  if (req.body.userType === "admin") {
    const { program, Id, password } = req.body;

    let admin = await Admin.findOne({ Id });

    if (admin) {
      req.session.error = "User already exists";
      return sendResponses.badRequest(res, "User already exists");
    }

    const hasdPsw = await bcrypt.hash(password, 12);

    try {
      admin = new Admin({
        program,
        Id,
        password: hasdPsw,

      });

      await admin.save();
    } catch (error) {
      res.send(error)
    }
  }

  if (req.body.userType === "student") {
    const { program, name, section, admissionNumber, password } = req.body;

    let student = await Student.findOne({ AdmissionNo:admissionNumber });

    if (student) {
      req.session.error = "User already exists";
      return sendResponses.badRequest(res, "User already exists");
    }

    const hasdPsw = await bcrypt.hash(password, 12);

    try {
      student = new Student({
        program,
        name,
        AdmissionNo: admissionNumber,
        password: hasdPsw,
        section
      });

      await student.save();
    } catch (error) {
      return sendResponses.serverError(res, error);
    }
  }
  return sendResponses.ok(res, "Registration successful");
};

