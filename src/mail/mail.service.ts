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

  async sendChangeEmailVerification(
    email: string,
    verificationLink: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_USER'),
        to: email,
        subject: 'Confirm Your New Email Address',
        html: `
          <h2>Confirm Your New Email Address</h2>
          <p>You requested to change your account email address to this email.</p>
          <p>Please click the button below to confirm and complete the change:</p>
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
            Confirm Email Change
          </a>
          <p>This link will expire in 30 minutes.</p>
          <p>If you did not request this email change, please ignore this email.</p>
        `,
      });
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  async sendChangeEmailSecurityAlert(
    oldEmail: string,
    newEmail: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_USER'),
        to: oldEmail,
        subject: 'Security Alert: Email Change Requested',
        html: `
          <h2>Security Alert</h2>
          <p>A request was recently made to change the email address of your account to <strong>${newEmail}</strong>.</p>
          <p>If you made this request, no further action is needed on this inbox. Please confirm the change via the verification link sent to your new email address.</p>
          <p>If you did <strong>not</strong> make this change, please change your password immediately or contact support.</p>
        `,
      });
    } catch (error) {
      console.error('Email sending failed:', error);
      // We do not fail the request if the security alert fails to send
    }
  }

  async sendPasswordChangedAlert(email: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_USER'),
        to: email,
        subject: 'Security Alert: Your Password Was Changed',
        html: `
          <h2>Your Password Has Been Changed</h2>
          <p>The password for your account was recently changed.</p>
          <p>If you made this change, no further action is needed.</p>
          <p>
            If you did <strong>not</strong> make this change, your account may be compromised.
            Please use the forgot password flow immediately to regain access, or contact support.
          </p>
        `,
      });
    } catch (error) {
      console.error('Email sending failed:', error);
      // We do not fail the request if the security alert fails to send
    }
  }
}


