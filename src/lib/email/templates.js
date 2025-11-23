// Email templates for various notifications

export const emailTemplates = {
  accountApproved: ({ name, loginUrl }) => ({
    subject: 'Welcome to Impress Cleaning Services! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Approved</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #079447 0%, #1C294E 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Welcome to Impress Cleaning!</h1>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="font-size: 18px; color: #1C294E; margin: 0 0 20px 0;">Hi ${name},</p>

                      <p style="font-size: 16px; color: #4a5568; line-height: 1.6; margin: 0 0 20px 0;">
                        Great news! Your account has been approved and you now have full access to our customer portal.
                      </p>

                      <p style="font-size: 16px; color: #4a5568; line-height: 1.6; margin: 0 0 30px 0;">
                        You can now:
                      </p>

                      <ul style="font-size: 16px; color: #4a5568; line-height: 1.8; margin: 0 0 30px 20px;">
                        <li>Request cleaning services</li>
                        <li>Manage your appointments</li>
                        <li>View service history</li>
                        <li>Pay invoices online</li>
                        <li>Manage your account settings</li>
                      </ul>

                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${loginUrl}" style="display: inline-block; background-color: #079447; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                              Access Your Portal
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="font-size: 14px; color: #718096; line-height: 1.6; margin: 30px 0 0 0; padding-top: 30px; border-top: 1px solid #e2e8f0;">
                        If you have any questions, feel free to reach out to us anytime.
                      </p>

                      <p style="font-size: 16px; color: #1C294E; margin: 20px 0 0 0;">
                        Best regards,<br>
                        <strong>The Impress Cleaning Team</strong>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }),

  appointmentConfirmed: ({ name, serviceType, date, time, address }) => ({
    subject: 'Appointment Confirmed ✓',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Appointment Confirmed</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background-color: #079447; padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Appointment Confirmed</h1>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 40px;">
                      <p style="font-size: 18px; color: #1C294E; margin: 0 0 20px 0;">Hi ${name},</p>

                      <p style="font-size: 16px; color: #4a5568; line-height: 1.6; margin: 0 0 30px 0;">
                        Your cleaning appointment has been confirmed! Here are the details:
                      </p>

                      <table width="100%" cellpadding="12" cellspacing="0" style="background-color: #f7fafc; border-radius: 8px; margin: 0 0 30px 0;">
                        <tr>
                          <td style="font-size: 14px; color: #718096; padding: 12px 20px;">Service Type:</td>
                          <td style="font-size: 16px; color: #1C294E; font-weight: 600; padding: 12px 20px; text-transform: capitalize;">${serviceType.replace('_', ' ')}</td>
                        </tr>
                        <tr>
                          <td style="font-size: 14px; color: #718096; padding: 12px 20px; border-top: 1px solid #e2e8f0;">Date:</td>
                          <td style="font-size: 16px; color: #1C294E; font-weight: 600; padding: 12px 20px; border-top: 1px solid #e2e8f0;">${date}</td>
                        </tr>
                        <tr>
                          <td style="font-size: 14px; color: #718096; padding: 12px 20px; border-top: 1px solid #e2e8f0;">Time:</td>
                          <td style="font-size: 16px; color: #1C294E; font-weight: 600; padding: 12px 20px; border-top: 1px solid #e2e8f0;">${time}</td>
                        </tr>
                        <tr>
                          <td style="font-size: 14px; color: #718096; padding: 12px 20px; border-top: 1px solid #e2e8f0;">Location:</td>
                          <td style="font-size: 16px; color: #1C294E; font-weight: 600; padding: 12px 20px; border-top: 1px solid #e2e8f0;">${address}</td>
                        </tr>
                      </table>

                      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin: 0 0 30px 0;">
                        <p style="font-size: 14px; color: #92400e; margin: 0;">
                          <strong>Please ensure:</strong><br>
                          • Someone is available to let our team in<br>
                          • Pets are secured in a safe area<br>
                          • Valuable items are stored away
                        </p>
                      </div>

                      <p style="font-size: 14px; color: #718096; line-height: 1.6; margin: 30px 0 0 0; padding-top: 30px; border-top: 1px solid #e2e8f0;">
                        Need to reschedule or have questions? Log in to your portal or contact us directly.
                      </p>

                      <p style="font-size: 16px; color: #1C294E; margin: 20px 0 0 0;">
                        Best regards,<br>
                        <strong>The Impress Cleaning Team</strong>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }),

  serviceRequestReceived: ({ name, serviceType, requestUrl }) => ({
    subject: 'Service Request Received',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Service Request Received</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background-color: #1C294E; padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Request Received</h1>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 40px;">
                      <p style="font-size: 18px; color: #1C294E; margin: 0 0 20px 0;">Hi ${name},</p>

                      <p style="font-size: 16px; color: #4a5568; line-height: 1.6; margin: 0 0 20px 0;">
                        Thank you for requesting a <strong style="text-transform: capitalize;">${serviceType.replace('_', ' ')}</strong> service!
                      </p>

                      <p style="font-size: 16px; color: #4a5568; line-height: 1.6; margin: 0 0 30px 0;">
                        Our team is reviewing your request and will get back to you within 24 hours to confirm your appointment.
                      </p>

                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${requestUrl}" style="display: inline-block; background-color: #079447; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                              View Your Request
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="font-size: 14px; color: #718096; line-height: 1.6; margin: 30px 0 0 0; padding-top: 30px; border-top: 1px solid #e2e8f0;">
                        We'll send you another email once your appointment is scheduled and confirmed.
                      </p>

                      <p style="font-size: 16px; color: #1C294E; margin: 20px 0 0 0;">
                        Best regards,<br>
                        <strong>The Impress Cleaning Team</strong>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }),

  invoiceReady: ({ name, invoiceNumber, amount, dueDate, payUrl }) => ({
    subject: `Invoice #${invoiceNumber} is Ready`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice Ready</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background-color: #1C294E; padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">New Invoice</h1>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 40px;">
                      <p style="font-size: 18px; color: #1C294E; margin: 0 0 20px 0;">Hi ${name},</p>

                      <p style="font-size: 16px; color: #4a5568; line-height: 1.6; margin: 0 0 30px 0;">
                        Your invoice for the recent cleaning service is now available.
                      </p>

                      <table width="100%" cellpadding="12" cellspacing="0" style="background-color: #f7fafc; border-radius: 8px; margin: 0 0 30px 0;">
                        <tr>
                          <td style="font-size: 14px; color: #718096; padding: 12px 20px;">Invoice Number:</td>
                          <td style="font-size: 16px; color: #1C294E; font-weight: 600; padding: 12px 20px;">#${invoiceNumber}</td>
                        </tr>
                        <tr>
                          <td style="font-size: 14px; color: #718096; padding: 12px 20px; border-top: 1px solid #e2e8f0;">Amount Due:</td>
                          <td style="font-size: 20px; color: #079447; font-weight: 700; padding: 12px 20px; border-top: 1px solid #e2e8f0;">$${amount.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td style="font-size: 14px; color: #718096; padding: 12px 20px; border-top: 1px solid #e2e8f0;">Due Date:</td>
                          <td style="font-size: 16px; color: #1C294E; font-weight: 600; padding: 12px 20px; border-top: 1px solid #e2e8f0;">${dueDate}</td>
                        </tr>
                      </table>

                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${payUrl}" style="display: inline-block; background-color: #079447; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                              Pay Invoice
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="font-size: 14px; color: #718096; line-height: 1.6; margin: 30px 0 0 0; padding-top: 30px; border-top: 1px solid #e2e8f0;">
                        You can pay securely online with a credit card or via Zelle.
                      </p>

                      <p style="font-size: 16px; color: #1C294E; margin: 20px 0 0 0;">
                        Best regards,<br>
                        <strong>The Impress Cleaning Team</strong>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }),

  paymentReceived: ({ name, invoiceNumber, amount, paymentDate }) => ({
    subject: 'Payment Received - Thank You!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Received</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background-color: #079447; padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Payment Received!</h1>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 40px;">
                      <p style="font-size: 18px; color: #1C294E; margin: 0 0 20px 0;">Hi ${name},</p>

                      <p style="font-size: 16px; color: #4a5568; line-height: 1.6; margin: 0 0 30px 0;">
                        Thank you! We've received your payment.
                      </p>

                      <table width="100%" cellpadding="12" cellspacing="0" style="background-color: #f0fdf4; border: 2px solid #079447; border-radius: 8px; margin: 0 0 30px 0;">
                        <tr>
                          <td style="font-size: 14px; color: #166534; padding: 12px 20px;">Invoice:</td>
                          <td style="font-size: 16px; color: #166534; font-weight: 600; padding: 12px 20px;">#${invoiceNumber}</td>
                        </tr>
                        <tr>
                          <td style="font-size: 14px; color: #166534; padding: 12px 20px; border-top: 1px solid #86efac;">Amount Paid:</td>
                          <td style="font-size: 20px; color: #079447; font-weight: 700; padding: 12px 20px; border-top: 1px solid #86efac;">$${amount.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td style="font-size: 14px; color: #166534; padding: 12px 20px; border-top: 1px solid #86efac;">Payment Date:</td>
                          <td style="font-size: 16px; color: #166534; font-weight: 600; padding: 12px 20px; border-top: 1px solid #86efac;">${paymentDate}</td>
                        </tr>
                      </table>

                      <p style="font-size: 16px; color: #4a5568; line-height: 1.6; margin: 0 0 30px 0;">
                        A receipt has been sent to your email and is also available in your customer portal.
                      </p>

                      <p style="font-size: 14px; color: #718096; line-height: 1.6; margin: 30px 0 0 0; padding-top: 30px; border-top: 1px solid #e2e8f0;">
                        We appreciate your business and look forward to serving you again!
                      </p>

                      <p style="font-size: 16px; color: #1C294E; margin: 20px 0 0 0;">
                        Best regards,<br>
                        <strong>The Impress Cleaning Team</strong>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }),

  appointmentReminder: ({ name, serviceType, date, time, address }) => ({
    subject: 'Reminder: Cleaning Appointment Tomorrow',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Appointment Reminder</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background-color: #f59e0b; padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Appointment Reminder</h1>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 40px;">
                      <p style="font-size: 18px; color: #1C294E; margin: 0 0 20px 0;">Hi ${name},</p>

                      <p style="font-size: 16px; color: #4a5568; line-height: 1.6; margin: 0 0 30px 0;">
                        This is a friendly reminder about your upcoming cleaning appointment:
                      </p>

                      <table width="100%" cellpadding="12" cellspacing="0" style="background-color: #fffbeb; border: 2px solid #f59e0b; border-radius: 8px; margin: 0 0 30px 0;">
                        <tr>
                          <td style="font-size: 14px; color: #92400e; padding: 12px 20px;">Service:</td>
                          <td style="font-size: 16px; color: #92400e; font-weight: 600; padding: 12px 20px; text-transform: capitalize;">${serviceType.replace('_', ' ')}</td>
                        </tr>
                        <tr>
                          <td style="font-size: 14px; color: #92400e; padding: 12px 20px; border-top: 1px solid #fde68a;">Date:</td>
                          <td style="font-size: 16px; color: #92400e; font-weight: 600; padding: 12px 20px; border-top: 1px solid #fde68a;">${date}</td>
                        </tr>
                        <tr>
                          <td style="font-size: 14px; color: #92400e; padding: 12px 20px; border-top: 1px solid #fde68a;">Time:</td>
                          <td style="font-size: 16px; color: #92400e; font-weight: 600; padding: 12px 20px; border-top: 1px solid #fde68a;">${time}</td>
                        </tr>
                        <tr>
                          <td style="font-size: 14px; color: #92400e; padding: 12px 20px; border-top: 1px solid #fde68a;">Location:</td>
                          <td style="font-size: 16px; color: #92400e; font-weight: 600; padding: 12px 20px; border-top: 1px solid #fde68a;">${address}</td>
                        </tr>
                      </table>

                      <p style="font-size: 16px; color: #4a5568; line-height: 1.6; margin: 0 0 20px 0;">
                        Please make sure:
                      </p>

                      <ul style="font-size: 16px; color: #4a5568; line-height: 1.8; margin: 0 0 30px 20px;">
                        <li>Someone is available to let our team in</li>
                        <li>Pets are secured</li>
                        <li>Valuable items are stored safely</li>
                      </ul>

                      <p style="font-size: 14px; color: #718096; line-height: 1.6; margin: 30px 0 0 0; padding-top: 30px; border-top: 1px solid #e2e8f0;">
                        Need to reschedule? Log in to your portal or contact us directly.
                      </p>

                      <p style="font-size: 16px; color: #1C294E; margin: 20px 0 0 0;">
                        Best regards,<br>
                        <strong>The Impress Cleaning Team</strong>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }),
}
