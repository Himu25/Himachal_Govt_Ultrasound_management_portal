const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Twilio account SID
const authToken = process.env.TWILIO_AUTH_TOKEN; // Your Twilio auth token
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER; // Your Twilio phone number

// Create a new Twilio client with your account SID and auth token
const twilioClient = twilio(accountSid, authToken);

// Define an asynchronous function to send an SMS message with Twilio
async function sendSMS(message, recipientPhoneNumber) {
  try {
    const response = await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: recipientPhoneNumber
    });

    console.log('SMS message sent with Twilio: ', response.sid);
    return response;
  } catch (error) {
    console.error('Error sending SMS message with Twilio: ', error);
    throw error;
  }
}

// Export the sendSMS function for use in other modules
module.exports = { sendSMS };
