
document.addEventListener('DOMContentLoaded', function() {
    fetchStudentData();
});


async function fetchStudentData(){
    try {
        const response = await axios.get('/student/studentData');
        const {message, data} = response.data;
        console.log(message);
        console.log(data);
        // You can use the fetched data to update the UI as needed
        const attendanceTableBody = document.getElementById('attendanceTableBody');
        attendanceTableBody.innerHTML = ''; // Clear existing rows
        data.courses.forEach(course => {
            const srNo= data.courses.indexOf(course) + 1;
            const courseId = course.courseId;
            const courseName = course.courseName;
            const attendedClasses = data.attendance[courseId] || 0;
            const totalClasses = data.totalClasses[courseId] || 0;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${srNo}</td>
                <td>${courseId}</td>
                <td>${courseName}</td>
                <td>${attendedClasses} / ${totalClasses}</td>
            `;
            attendanceTableBody.appendChild(row);
        });

        const profile = data.profile;
        document.getElementById('studentName').textContent = profile.name;
        document.getElementById('studentAdmissionNo').textContent = profile.admissionNo;
        document.getElementById('studentProgram').textContent = profile.program;
        document.getElementById('studentSection').textContent = `Section: ${profile.section}`;


    } catch (error) {
        handleErrorMessage(error);
    }
}    



function fetchLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    resolve({ latitude, longitude });
                },
                function (error) {
                    reject('Error fetching geolocation: ' + error.message);
                }
            );
        } else {
            reject('Geolocation is not supported by this browser.');
        }
    });
}




// Event Listeners for the buttons

document.getElementById('scanButton').addEventListener('click', async function () {

    try {
        let Scanner = new Html5QrcodeScanner("videoContainer",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            },
      /* verbose= */ false);
    
        async function onScanSuccess(result) {
            try {
                // handle the scanned code
        
                Scanner.clear();
                document.getElementById("videoContainer").remove();
        
                let location = await fetchLocation();
                console.log('From Frontend', location);
               const response = await axios.post(result, {
                    latitudeInput: location.latitude,
                    longitudeInput: location.longitude
                });
                const {message, data}= response.data;
                console.log(message, data)
                window.location.reload();
            } catch (error) {
                handleErrorMessage(error);
            }
    
        }
    
        function onScanFailure(error) {
            // handle scan failure, usually better to ignore and keep scanning.
            console.warn(`Code scan error = ${error}`);
        }
        Scanner.render(onScanSuccess, onScanFailure);
    } catch (error) {
        handleErrorMessage(error);
    }
});

document.getElementById('logoutButton').addEventListener('click', function () {
    fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.ok) {
                window.location.href = '/';
            } else {
                alert('Logout failed.');
            }
        })
})


function handleErrorMessage(error) {
    if (error.response) {
        alert(`${error.response.data?.message || error.response.statusText}`);
    } else if (error.request) {
        console.log(`No response from server. Please check your network or server status.`);
    } else {
        console.log(`Error: ${error.message}`);
    }
}