import resend from "./resendConfig.js";

export async function sendTestEmail(recipient) {
  await resend.emails.send({
    from: "SplitSavvy <splitsavvy@savry.in>",
    to: recipient,
    subject: "Test Email from SplitSavvy",
    html: "<strong>This is a test email sent using Resend + Nodemailer</strong>",
  });
}
