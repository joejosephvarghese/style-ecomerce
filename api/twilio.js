require('dotenv').config()

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;
const client = require('twilio')(accountSid, authToken);


const sendOtp = async (number) => {

    return new Promise((resolve, reject) =>{

        client.verify.v2.services(serviceSid)
                    .verifications
                    .create({to: `+91${number}`, channel: 'sms'})
                    .then(verification => resolve(verification.sid));
    })


}


const verifyOtp = (number, otp) =>{

    return new Promise((resolve, reject) =>{
        client.verify.v2.services(serviceSid)
        .verificationChecks
        .create({to: `+91${number}`, code: `${otp}`})
        .then(verification => resolve(verification.valid));
    })
}


module.exports = {
    sendOtp,
    verifyOtp
}
