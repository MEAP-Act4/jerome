import nodemailer from "nodemailer";

export async function sendVerificationCode(
  email: string,
  code: string
): Promise<boolean> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");

  if (!user || !pass) return false;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `JEROME <${user}>`,
      to: email,
      subject: `Your JEROME verification code: ${code}`,
      text: [
        `Your JEROME verification code is ${code}.`,
        "",
        "It expires in 10 minutes.",
        "If you didn't create an account, you can safely ignore this email.",
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#18201d">
          <h2 style="margin:0 0 12px;color:#143D30">Verify your JEROME account</h2>
          <p style="margin:0 0 16px;line-height:1.6">Enter this code to finish setting up your account:</p>
          <p style="margin:0 0 16px;font-size:32px;font-weight:700;letter-spacing:8px;color:#143D30">${code}</p>
          <p style="margin:0;line-height:1.6;color:#67716c">The code expires in 10 minutes. If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error("[mailer] Failed to send verification email", error);
    return false;
  }
}
