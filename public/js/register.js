

async function handleStudentFormSubmit(event) {
    event.preventDefault();
    const userType= "student"
    const program= event.target.program.value;
    const name= event.target.name.value;
    const section= event.target.section.value;
    const admissionNumber= event.target.admissionNumber.value;
    const password= event.target.password.value;
    try {
        const response = await axios.post('/user/register', {
            userType,
            program,
            name,
            section,
            admissionNumber,
            password
        });
        const {message, data} = response.data;
        console.log(message,data)
        alert(message);
        window.location.href = '/';
    } catch (error) {
        handleErrorMessage(error);
    }
}

async function handleAdminFormSubmit(event) {
    event.preventDefault();
    const userType= "admin"
    const program= event.target.program.value;
    const Id= event.target.Id.value;
    const password= event.target.password.value;
    try {
        const response = await axios.post('/user/register', {
            userType,
            program,
            Id,
            password
        });
        
        const {message, data} = response.data;
        console.log(message,data)
        alert(message);
        window.location.href = '/';

    } catch (error) {
        handleErrorMessage(error);
    }
}


        
document.getElementById('userTypeSelect').addEventListener('change', function () {
    let userType = this.value;
    if (userType === 'student') {
        document.getElementById('studentForm').classList.remove('hidden');
        document.getElementById('adminForm').classList.add('hidden');
    } else if (userType === 'admin') {
        document.getElementById('studentForm').classList.add('hidden');
        document.getElementById('adminForm').classList.remove('hidden');
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
