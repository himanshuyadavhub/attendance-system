
document.addEventListener('DOMContentLoaded', fetchAttendance);


async function fetchAttendance() {
    const {courseId, section}= JSON.parse(localStorage.getItem('courseAndSection'));
    try {
        const response = await axios.get(`/admin/attendancerecord/data?course_id=${courseId}&section=${section}`);
        const {message, data} = response.data;
        console.log(message);
        console.log(data);

        if (!data.records || data.records.length === 0) {
            document.getElementById('records').innerHTML = 'No Attendance Records Found';
        } else {
            const tbody = document.getElementById('attendanceTableBody');
            tbody.innerHTML = '';
            data.records.forEach(record => {
                const tr = document.createElement('tr');
                const tdAdmission = document.createElement('td');
                tdAdmission.innerText = record.AdmissionNo;
                const tdName = document.createElement('td');
                tdName.innerText = record.name;
                const tdCount = document.createElement('td');
                tdCount.innerText = record.attendanceCount;
                tr.appendChild(tdAdmission);
                tr.appendChild(tdName);
                tr.appendChild(tdCount);
                tbody.appendChild(tr);
            });
        }
            document.getElementById('totalClasses').innerText = `Total classes: ${data.totalClasses}`;
            document.getElementById('classDetails').innerHTML = `
                <h3>Attendance Record</h3>
                <h3>Course ID: ${data.course_id}</h3>
                <h3>Section: ${data.section}</h3>`;
    } catch (error) {
        handleErrorMessage(error);
    }
}

function logout() {
    localStorage.removeItem('courseAndSection');
    fetch('/logout', {
        method: 'POST'
    }).then(response => {
        if (response.ok) {
            location.href = '/'
        } else {
            alert('Logout failed')
        }
    })
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