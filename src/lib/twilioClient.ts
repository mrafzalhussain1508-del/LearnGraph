import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();

export const isTwilioConfigured = Boolean(
  accountSid && 
  authToken && 
  !accountSid.startsWith('your_') && 
  !accountSid.startsWith('[') &&
  !authToken.startsWith('your_') &&
  !authToken.startsWith('[')
);

export function getTwilioClient() {
  if (!accountSid || !authToken) {
    throw new Error(
      'Twilio credentials (TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN) are missing. Please add them to your .env.local file.'
    );
  }
  return twilio(accountSid, authToken);
}

export const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
export const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886';
export const TWILIO_VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;
