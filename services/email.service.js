import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.IMAP_USER,
        pass: process.env.IMAP_PASSWORD, // Gmail App Password
    },
});

export const sendResolutionEmail = async (to, subject) => {
    const mailOptions = {
        from: process.env.IMAP_USER,
        to: to,
        subject: `Ticket Resolved: ${subject}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #16a34a;">Your Ticket has been Resolved!</h2>
                <p>Hello,</p>
                <p>We are happy to inform you that your ticket regarding <strong>"${subject}"</strong> has been resolved by our support team.</p>
                <p>If you have any further questions or if the issue persists, please feel free to reply to this email.</p>
                <br/>
                <p>Best Regards,</p>
                <p><strong>Helpdesk Support Team</strong></p>
                <hr style="border: 0; border-top: 1px solid #eee;" />
                <p style="font-size: 12px; color: #999;">This is an automated notification. Please do not reply directly to this message unless you have further questions.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Resolution email sent to ${to}`);
    } catch (error) {
        console.error('Error sending resolution email:', error);
    }
};
