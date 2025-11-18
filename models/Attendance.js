const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const attendanceSchema = new Schema({
    AdmissionNo: {
        type: String,
        required: true
    },
    course_id: {
        type: String,
        required: true
    },
    presentDates: {
        type: [Date],
        required: true,
        default: []
    }
});



module.exports =  mongoose.model('Attendance', attendanceSchema);

