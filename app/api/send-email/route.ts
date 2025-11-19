import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  try {
    const { recipient, subject, text, body, anomalies, metadata } = await request.json()

    const smtpHost = process.env.SMTP_HOST
    const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const smtpSecure = process.env.SMTP_SECURE === 'true'

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      return new Response('SMTP configuration missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS env vars.', { status: 500 })
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    const plainText = text || body || (anomalies ? `Anomalies detected: ${anomalies.map((a: any) => a.type).join(', ')}` : 'Anomaly detected')

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000' 

    // Build a professional HTML email
    const timestamp = new Date().toLocaleString()

    const anomaliesHtml = Array.isArray(anomalies) && anomalies.length > 0
      ? `
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 12px; background: #f1f5f9; border: none; color: #334155; font-weight: 600; font-size: 13px;">Anomaly</th>
              <th style="text-align: left; padding: 12px; background: #f1f5f9; border: none; color: #334155; font-weight: 600; font-size: 13px;">Severity</th>
              <th style="text-align: left; padding: 12px; background: #f1f5f9; border: none; color: #334155; font-weight: 600; font-size: 13px;">Details</th>
            </tr>
          </thead>
          <tbody>
            ${anomalies.map((a: any) => {
              const sev = String(a.severity || '').toLowerCase()
              const badgeStyle = sev === 'critical' ? 'background: #fee2e2; color: #dc2626;' : sev === 'warning' ? 'background: #fef3c7; color: #d97706;' : 'background: #dbeafe; color: #2563eb;'
              const label = (a.label || a.type || '').toString()
              const note = (a.note || a.message || 'Detected')
              return `
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 13px;">${label}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 13px;"><span style="display: inline-block; padding: 6px 12px; border-radius: 20px; font-weight: 600; font-size: 11px; ${badgeStyle}">${(a.severity || '').toUpperCase()}</span></td>
                  <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 13px;">${note}</td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>
      `
      : ''

    const logo = process.env.NEXT_PUBLIC_LOGO_URL || ''
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 0; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; }
            .container { max-width: 640px; margin: 0 auto; padding: 24px 16px; }
            .card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
            .header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
            .logo-box { width: 48px; height: 48px; border-radius: 10px; background: linear-gradient(135deg, #06b6d4, #3b82f6); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 20px; flex-shrink: 0; }
            .header-text h1 { margin: 0; font-size: 20px; font-weight: 700; color: #0f172a; line-height: 1.2; }
            .header-text p { margin: 6px 0 0 0; font-size: 13px; color: #64748b; }
            .content { margin-bottom: 24px; }
            .message { font-size: 14px; color: #1e293b; line-height: 1.6; margin: 0 0 20px 0; }
            .table-wrapper { margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th { text-align: left; padding: 12px; background: #f1f5f9; border: none; color: #334155; font-weight: 600; }
            td { padding: 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
            .badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-weight: 600; font-size: 11px; }
            .badge-critical { background: #fee2e2; color: #dc2626; }
            .badge-warning { background: #fef3c7; color: #d97706; }
            .badge-info { background: #dbeafe; color: #2563eb; }
            .footer-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0; flex-wrap: wrap; gap: 16px; }
            .timestamp { font-size: 12px; color: #64748b; }
            .cta-btn { display: inline-block; padding: 12px 10px; background: #0d9488; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 13px; transition: background 0.2s; }
            .cta-btn:hover { background: #0f766e; }
            .footer-text { text-align: center; margin-top: 16px; font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">
                <div class="logo-box">SE</div>
                <div class="header-text">
                  <h1>${subject || 'Smart Energy Grid Alert'}</h1>
                  <p>Automated alert from <strong>Shakti Smart Energy Dashboard</strong></p>
                </div>
              </div>

              <div class="content">
                <p class="message">${plainText}</p>
                ${anomaliesHtml ? `<div style="margin-top: 20px;">${anomaliesHtml}</div>` : ''}
              </div>

              <div class="footer-actions">
                <div class="timestamp"> ${timestamp}</div>
                <a href="${baseUrl}" class="cta-btn">→ Open Dashboard</a>
              </div>
            </div>

            <div class="footer-text">
              <p style="margin: 0;">You are receiving this because you are subscribed to Shakti Smart Energy Dashboard alerts.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const mailOptions = {
      from: `"Smart Energy Dashboard" <${smtpUser}>`,
      to: recipient || 'prasanna.pandharikar22@spit.ac.in',
      subject: subject || 'Smart Grid Alert',
      text: plainText,
      html,
    }

    await transporter.sendMail(mailOptions)

    return new Response('Email sent', { status: 200 })
  } catch (err: any) {
    console.error('send-email error', err)
    return new Response(err?.message || 'Unknown error', { status: 500 })
  }
}
