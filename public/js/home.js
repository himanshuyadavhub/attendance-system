

document.getElementById('userTypeSelect').addEventListener('change', function () {
    var userType = this.value;
    if (userType === 'student') {
        document.getElementById('studentForm').classList.remove('hidden');
        document.getElementById('adminForm').classList.add('hidden');
    } else if (userType === 'admin') {
        document.getElementById('studentForm').classList.add('hidden');
        document.getElementById('adminForm').classList.remove('hidden');
    }
});

async function handleAdminFormSubmit(event) {
    event.preventDefault();
    const id= event.target.adminId.value;
    const password = event.target.password.value;

    try {
        const response = await axios.post('/admin/login', { id, password });
        if (response.status === 200) {
            window.location.href = '/admin/panel';
        }
    } catch (error) {
        handleErrorMessage(error);
    }
}


async function handleStudentFormSubmit(event) {
    event.preventDefault();
    const admissionNo = event.target.admissionNo.value;
    const password = event.target.password.value;
    try {
        const response = await axios.post('/student/login', { admissionNo, password });
        if (response.status === 200) {
            window.location.href = '/student/dashboard';
        }
    } catch (error) {
        handleErrorMessage(error);
    }
}


function registerBtnHandler() {
    window.location.href = "/user/register"
}

function handleErrorMessage(error) {
    if (error.response) {
        alert(`${error.response.data?.message || error.response.statusText}`);
    } else if (error.request) {
        console.log(`No response from server. Please check your network or server status.`);
    } else {
        console.log(`Error: ${error.message}`);
    }
}
