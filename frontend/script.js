const url = `http://localhost:4000`;

function signUp(e) {

    e.preventDefault();

    var name = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirmPassword').value;


    var isPasswordMatch = password === confirmPassword;
    if (!isPasswordMatch) {
        document.getElementById('passwordMain').innerText = '';
        document.getElementById('passwordError').innerText = 'Passwords do not match';
    } else
        document.getElementById('passwordError').innerText = '';


    if (isPasswordMatch) {

        var minLength = 8;
        var hasUppercase = /[A-Z]/.test(password);
        var hasLowercase = /[a-z]/.test(password);
        var hasSpecialCharacter = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password);

        if (password.length < minLength)
            document.getElementById('passwordMain').innerText = 'Password should have 8 characters';

        else if (!hasUppercase)
            document.getElementById('passwordMain').innerText = 'Password should have atleast one uppercase character';

        else if (!hasLowercase)
            document.getElementById('passwordMain').innerText = 'Password should have atleast one lowercase character';

        else if (!hasSpecialCharacter)
            document.getElementById('passwordMain').innerText = 'Password should have atleast one special character';

        else {


            let obj = {
                name,
                email,
                password
            }

            axios.post(`${url}/users/addUser`, obj)
                .then(respond => {

                    var msg = respond.data.message;
                    var check = respond.data.check;

                    alert(`${msg}`);

                    if (check)
                        window.location.replace("./login.html");
                    else
                        window.top.location = window.top.location;
                })
                .catch(err => console.log(err));

        }
    }
}

function logIn(e) {

    e.preventDefault();

    document.getElementById('loginMessage').innerText = ``;


    var email = document.getElementById('email_login').value;
    var password = document.getElementById('password_login').value;

    let obj = {
        email,
        password
    }

    axios.post(`${url}/users/loginUser`, obj)
        .then(respond => {

            let token = respond.data.token;

            localStorage.setItem('token', token);
            
            window.location.replace("./dashboard.html");

        })
        .catch(err => {
            const message = err.response.data.display;
            
            document.getElementById('loginMessage').innerText = `${message}`;
            
        });

}

async function forgotPassword(e) {
    try{
    e.preventDefault();

    
    document.getElementById('forgotPasswordMessage').innerHTML = '';

    var email = document.getElementById('email_login').value;

    let obj = {
        email
    }

    const forgotEmail  = await axios.post(`${url}/users/password/forgotPassword`, obj);

    if(forgotEmail.data.status){
        document.getElementById('forgotPasswordMessage').innerHTML = '';
        alert(`Reset Link sent successfully`);
    
    }
    }catch(err){
        document.getElementById('forgotPasswordMessage').innerHTML = 'Email id is not registered !';
        console.log(err);
    }
    
}