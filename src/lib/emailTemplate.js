const LOGO_URL = 'https://bzcdasbrdaonxpomzakh.supabase.co/storage/v1/object/public/public-assets/logo_impress_white.png'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://impressyoucleaning.com'

export const serviceLabelMap = {
  standard: 'Standard Cleaning',
  deep: 'Deep Cleaning',
  move_in_out: 'Move In/Out Cleaning',
  post_construction: 'Post-Construction Cleaning',
  office: 'Office Cleaning',
}

export function formatTime(timeStr) {
  if (!timeStr) return ''
  const [hours, minutes] = timeStr.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

export function formatDate(dateStr) {
  if (!dateStr) return 'TBD'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function generateEmailTemplate({ eyebrow, title, subtitle, contentHtml, buttonText, buttonUrl, footerNote }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="width: 100%; padding: 24px 0;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);">

      <!-- LOGO HEADER -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center" style="padding: 0;">
            <div style="background: linear-gradient(180deg,#d5d8dc 0%,#cdd0d4 50%,#d5d8dc 100%); background-image: url('${LOGO_URL}'), linear-gradient(180deg,#d5d8dc 0%,#cdd0d4 50%,#d5d8dc 100%); background-repeat: no-repeat, no-repeat; background-position: center, center; background-size: 200px auto, cover; width: 100%; height: 150px;">&nbsp;</div>
          </td>
        </tr>
      </table>

      <!-- TITLE / COPY -->
      <div style="padding: 32px 32px 8px;">
        <p style="font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #6b7280; margin: 0 0 8px;">${eyebrow}</p>
        <h1 style="font-size: 28px; line-height: 1.2; font-weight: 700; color: #111827; margin: 0 0 12px;">${title}</h1>
        <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin: 0;">${subtitle}</p>
      </div>

      <!-- CONTENT -->
      <div style="padding: 0 32px;">
        ${contentHtml}
      </div>

      <!-- BUTTON -->
      ${buttonText && buttonUrl ? `
      <div style="padding: 8px 32px 8px; text-align: center;">
        <a href="${buttonUrl}" style="display: inline-block; background-color: #079447; color: #ffffff !important; text-decoration: none; padding: 18px 48px; border-radius: 999px; font-size: 16px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; box-shadow: 0 8px 18px rgba(7, 148, 71, 0.28);">${buttonText}</a>
      </div>

      <!-- ALT LINK -->
      <div style="padding: 16px 32px 0; text-align: center; font-size: 13px; color: #6b7280;">
        <p style="margin: 0 0 8px 0;">If the button above doesn't work, <a href="${buttonUrl}" style="color: #079447; text-decoration: underline;">click here</a>.</p>
      </div>
      ` : ''}

      <!-- HELP BOX -->
      <div style="margin: 20px auto 36px; padding: 18px 20px; max-width: 240px; background-color: #f3f4f6; border-radius: 10px; font-size: 12px; color: #374151; text-align: center;">
        <p style="margin: 0 0 4px 0; font-weight: 600;">Have a question?</p>
        <p style="margin: 4px 0 0;"><a href="mailto:support@impressyoucleaning.com" style="color: #079447; text-decoration: underline;">Reach out to our team</a></p>
      </div>

      <!-- FOOTER -->
      <div style="padding: 28px 32px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 2px 0; font-size: 11px; font-weight: 600; color: #6b7280;">Impress Cleaning Services, LLC</p>
        <p style="margin: 2px 0; font-size: 10px; color: #6b7280;">1530 Sun City Blvd, Suite 120-403, Georgetown, TX 78633</p>
        <p style="margin: 2px 0; font-size: 10px; color: #6b7280;">© 2025 Impress Cleaning Services, LLC. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `
}

export function generateAppointmentDetailsHtml({ serviceLabel, formattedDate, timeRange, address }) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
      <tr>
        <td style="background-color: #f9fafb; border-radius: 10px; padding: 20px;">
          <p style="margin: 0 0 12px; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #6b7280; font-weight: 600;">Appointment Details</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-size: 14px;">Service</span>
              </td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                <span style="color: #111827; font-size: 14px; font-weight: 600;">${serviceLabel}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-size: 14px;">Date</span>
              </td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                <span style="color: #111827; font-size: 14px; font-weight: 600;">${formattedDate}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-size: 14px;">Time</span>
              </td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                <span style="color: #111827; font-size: 14px; font-weight: 600;">${timeRange}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: #6b7280; font-size: 14px;">Location</span>
              </td>
              <td style="padding: 8px 0; text-align: right;">
                <span style="color: #111827; font-size: 14px; font-weight: 600;">${address}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `
}

export function generateInfoBox({ bgColor, borderColor, textColor, content }) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 24px;">
      <tr>
        <td style="background-color: ${bgColor}; border-left: 4px solid ${borderColor}; border-radius: 0 8px 8px 0; padding: 16px;">
          <p style="margin: 0; color: ${textColor}; font-size: 14px; line-height: 1.5;">${content}</p>
        </td>
      </tr>
    </table>
  `
}