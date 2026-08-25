export const renderResetPasswordHtml = (
  fullname: string,
  resetLink: string,
): string => {
  return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; text-align: center; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hello ${fullname},</p>
            <p>You recently requested to reset your password for your account.</p>
            <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; background-color: #007bff; color: white !important; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Reset My Password
            </a>
            <p style="font-size: 14px; color: #777;">This link will expire in 1 hour.</p>
            <p style="font-size: 12px; color: #aaa;">If you did not request a password reset, please ignore this email.</p>
        </div>
    `;
};
