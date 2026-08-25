import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: this.configService.get<string>('MAIL_SERVICE'),
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });
  }

  async sendResetPasswordEmail(
    email: string,
    resetLink: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_USER'),
        to: email,
        subject: 'Reset Your Password',
        html: `
          <h2>Reset Your Password</h2>

          <p>
            You requested to reset your password.
          </p>

          <p>
            Click the button below to reset your password:
          </p>

          <a
            href="${resetLink}"
            style="
              display: inline-block;
              padding: 10px 20px;
              background: #007bff;
              color: white;
              text-decoration: none;
              border-radius: 5px;
            "
          >
            Reset Password
          </a>

          <p>
            This link will expire in 15 minutes.
          </p>

          <p>
            If you did not request a password reset,
            you can safely ignore this email.
          </p>
        `,
      });
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  async sendVerificationEmail(
    email: string,
    verificationLink: string,
  ): Promise<void> {
    await this.transporter.sendMail({
      from: this.configService.get<string>('MAIL_USER'),
      to: email,
      subject: 'Verify Your Email',
      html: `
      <h2>Verify Your Email</h2>

      <p>
        Thank you for registering.
      </p>

      <p>
        Please click the button below to verify your email.
      </p>

      <a
        href="${verificationLink}"
        style="
          display: inline-block;
          padding: 10px 20px;
          background: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
        "
      >
        Verify Email
      </a>

      <p>
        This link will expire in 24 hours.
      </p>
    `,
    });
  }
}
