import { resend } from "@/lib/resend";

import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/Apiresponse";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: email,
      subject: 'Hello world verification code',
      react: VerificationEmail({username, otp:verifyCode}),
    });
    return { success: true, message: "verification email send successfully" };
  } catch (emailError) {
    console.error("Error sending verification email");
    return { success: false, message: "failed to send verification email" };
  }
}
