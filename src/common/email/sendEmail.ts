import nodemailer from "nodemailer";
import { env } from "../../config/env.service.js";
import type Mail from "nodemailer/lib/mailer/index.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  //   host: "smtp.gmail.com",
  //   port: 587,
  //   secure: false, // true for 465, false for other ports
  auth: {
    user: env.GOOGLE_EMAIL, // your email address
    pass: env.GOOGLE_PASSWORD, // your email password
  },
});

export const sendEmail = async ({
  to,
  subject,
  html,
}: Mail.Options): Promise<void> => {
  transporter.sendMail({
    from: `socialMediaApp <${env.GOOGLE_EMAIL}>`, // sender address
    to,
    subject,
    html,
  });

  console.log("email sent correctily");
};
