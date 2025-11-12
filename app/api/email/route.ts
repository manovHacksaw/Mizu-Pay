import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log("VARIABLES: ", process.env.EMAIL_HOST, process.env.EMAIL_PORT, process.env.EMAIL_USER, process.env.EMAIL_PASS);
    const mailer = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });



    await mailer.sendMail({
      from: `"Mizu Pay" <${process.env.EMAIL_USER}>`,
      to: 'candyshutter0@gmail.com',
      subject: `🎉 Your STORE Gift Card is Ready`,
      html: `
        <div style="font-family:sans-serif;padding:20px;">
          <h2>Thanks for using Mizu Pay!</h2>
          <p>Your gift card for <b>STORE</b> is ready.</p>

          <div style="margin-top:16px;padding:12px;border-radius:8px;background:#f7f7f7;">
            <p><b>Gift Card Code:</b> GIFT_CARD_CODE</p>
          </div>

          <p style="margin-top:20px;">Enjoy your purchase 🎁</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "Email sent ✅" });

  } catch (error: any) {
    console.error("Email send error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
