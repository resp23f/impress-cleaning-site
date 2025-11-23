import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Send an email using Resend API
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email address
 * @param {string} params.subject - Email subject
 * @param {string} params.html - HTML email content
 * @param {string} [params.from] - Sender email (defaults to env variable)
 * @returns {Promise<Object>} Resend API response
 */
export async function sendEmail({ to, subject, html, from }) {
  try {
    const data = await resend.emails.send({
      from: from || process.env.RESEND_FROM_EMAIL || 'Impress Cleaning <noreply@impresscleaning.com>',
      to: [to],
      subject,
      html,
    })

    console.log('✅ Email sent successfully:', { to, subject, id: data.id })
    return { success: true, data }
  } catch (error) {
    console.error('❌ Error sending email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send an email using a template
 * @param {string} to - Recipient email address
 * @param {string} templateName - Name of template to use
 * @param {Object} templateData - Data to pass to template
 * @returns {Promise<Object>} Send result
 */
export async function sendTemplateEmail(to, templateName, templateData) {
  const { emailTemplates } = await import('./templates')

  if (!emailTemplates[templateName]) {
    throw new Error(`Email template "${templateName}" not found`)
  }

  const { subject, html } = emailTemplates[templateName](templateData)

  return sendEmail({ to, subject, html })
}
