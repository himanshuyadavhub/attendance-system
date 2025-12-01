
async function handleQrCodeGenerateFormSubmit(event) {
    event.preventDefault();
    const courseId = event.target.courseId.value;
    const section = event.target.section.value;

    try {
        const timeStamp = Date.now();
        const response= await axios.post('/admin/qrcode', {courseId, section, timeStamp});
        const {message, data}= response.data;
        localStorage.setItem('generatedQR', data._id);
    
        window.location.href = '/admin/qrcode';
    } catch (error) {
        handleErrorMessage(error);
    }


}

async function handleViewAttendanceFormSubmit(event) {
    event.preventDefault();
    const courseId = event.target.courseId.value;
    const section = event.target.section.value;

    localStorage.setItem('courseAndSection', JSON.stringify({courseId, section}));

    window.location.href = '/admin/attendancerecord';
}

document.getElementById('actionSelect').addEventListener('change', function () {
            let toView = this.value;
            console.log(this.value);
            if (toView === "generateQR") {
                document.getElementById("ViewAttendance").classList.add('hidden');
                document.getElementById("GenerateQR").classList.remove('hidden');
            } else if (toView === "ViewAttendance") {
                document.getElementById("ViewAttendance").classList.remove('hidden');
                document.getElementById("GenerateQR").classList.add('hidden');
            }
}); 


function handleErrorMessage(error) {
    if (error.response) {
        alert(`${error.response.data?.message || error.response.statusText}`);
    } else if (error.request) {
        console.log(`No response from server. Please check your network or server status.`);
    } else {
        console.log(`Error: ${error.message}`);
    }
}
