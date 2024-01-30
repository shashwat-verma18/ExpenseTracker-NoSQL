const User = require('../models/userModel');
const ForgotPassword = require('../models/forgotPasswordRequestsModel');
const Sib = require('sib-api-v3-sdk');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const path = require('path');

var userPassId;

exports.resetPassword = async (req, res) => {

    
    const email = req.body.email;

    const user = await User.findOne({ where: { email: email } });

    if (user) {

        const id = uuid.v4();
        const forgotPasswordCreated = await ForgotPassword.create({id, userId: user.id, isActive: true})
        
        const email = user.email;
        const name = user.name;

        const client = Sib.ApiClient.instance;

        const apiKey = client.authentications['api-key'];
        apiKey.apiKey = process.env.BREVO_API_KEY;

        const tranEmailApi = new Sib.TransactionalEmailsApi();

        const sender = {
            email: 'shashwatv18@gmail.com',
            name: 'Expense Tracker'
        }

        const receivers = [
            {
                email: `${email}`
            },
        ]

        const response = await tranEmailApi.sendTransacEmail({
            sender,
            to: receivers,
            subject: 'Reset Password',
            htmlContent: `
            <p>Hi ${name}, </p>
            <p>A password reset for your account was requested. </p>
            <p>Please click the button below to change your password.
            Note that this link is valid for limited time. After the time limit has expired, you will have to resubmit the request for a password reset.</p>
            <a href="http://localhost:4000/users/password/resetPassword/${id}"><button style="background-color: #4caf50; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">Change your Password</button></a> 
            `
        });

        return res.status(200).json({ response, status: true });
    } else {
        return res.status(404).json({ message: "Email id is not registered !", status: false });
    }
}



exports.viewPage = async (req, res) => {
    try {

        const id = req.params.id;

        const active = await ForgotPassword.findOne({where: {id: id}});

        userPassId = active.userId;

        if(active.isActive){
            
            await active.update({isActive : false});

            res.sendFile(path.join(__dirname,`..`,`..`,`frontend`,`updatePassword.html`));

        }


    } catch (err) {
        console.log(err);
    }
}

exports.updatePassword = async (req, res) => {
    try{
        const password = req.body.password;

        console.log(password+" : "+userPassId);

        const hashedPassword = await bcrypt.hash(password,10);
        const user = await User.findOne({where: {id: userPassId}});

        const respond = await user.update({password: hashedPassword});

        res.status(200).json({message: "Password updated successfully !", check: true});

    }catch(err){
        res.status(500).json({message: "Something went wrong", check: false});
        console.log(err);
    }
}
