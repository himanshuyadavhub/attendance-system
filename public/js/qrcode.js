

document.addEventListener('DOMContentLoaded', fetchQRCode);


async function fetchQRCode() {
    try {
        const response = await axios.get(`/admin/qrurl/id/${localStorage.getItem('generatedQR')}`);
        const { message, data } = response.data;
        console.log(message, data);
        document.getElementById('qrcode').src = data.qrUrl;
        const detailsDiv = document.querySelector('.details');
        detailsDiv.innerHTML = `
            <h3>${data.program}</h3>
            <h3>Section: ${data.section}</h3>
            <h3>Course ID: ${data.course_id}</h3>
        `;
    } catch (error) {
        handleErrorMessage(error);
    }
}

function logout() {
    localStorage.removeItem('generatedQR');
    fetch('/logout', { method: 'POST' })
        .then(response => {
            if (response.ok) {
                location.href = '/';
            } else {
                alert('Logout failed!');
            }
        })
};



function handleErrorMessage(error) {
    if (error.response) {
        alert(`${error.response.data?.message || error.response.statusText}`);
    } else if (error.request) {
        console.log(`No response from server. Please check your network or server status.`);
    } else {
        console.log(`Error: ${error.message}`);
    }
}
