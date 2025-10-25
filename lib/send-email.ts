// Core email sending function - Following Chingu's exact pattern
// This is the main function that sends emails to any address

import { Resend } from "resend";

type SendEmailParams = {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
};

export async function sendEmail({ to, subject, react }: SendEmailParams) {
  const resend = new Resend(process.env.RESEND_API_KEY || "re_jgeAFYyS_FbLHoLA197Mn4iWnLpsL5Mrn");
  
  try {
    const data = await resend.emails.send({
      from: "Mizu Pay <onboarding@resend.dev>", // Using Resend's default domain
      to,
      subject,
      react
    });

    console.log("Email sent successfully!", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
