const http = require('http');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.json': 'application/json'
};

// In-memory OTP store (email -> { code, expiresAt })
const otps = new Map();

// Nodemailer setup — Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sjc.counselling.anuradhpura@gmail.com',
    pass: 'snkp sino pylc yoku'
  }
});

const handleApiRequest = (req, res, urlPath) => {
  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', async () => {
    try {
      const data = JSON.parse(body || '{}');
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
      }

      if (urlPath === '/api/auth/request-code') {
        const { email } = data;
        if (!email) {
          res.writeHead(400);
          return res.end(JSON.stringify({ success: false, error: 'Email required' }));
        }

        // Generate 6 digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        otps.set(email, {
          code,
          expiresAt: Date.now() + 10 * 60 * 1000 // 10 mins valid
        });

        console.log(`[OTP] Code for ${email} is ${code}`);

        try {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || '"SJC Counselling" <sjc.counselling.anuradhapura@gmail.com>',
            to: email,
            subject: 'Your SJC Portal OTP Code',
            text: `Your OTP code is: ${code}\nThis code will expire in 10 minutes.`,
            html: `<h3>SJC Counselling Portal</h3><p>Your verification code is: <strong>${code}</strong></p><p>This code will expire in 10 minutes.</p>`
          });
          res.writeHead(200);
          res.end(JSON.stringify({ success: true }));
        } catch (mailErr) {
          console.error('[OTP Email Error]', mailErr);
          res.writeHead(500);
          res.end(JSON.stringify({ success: false, error: 'Failed to send email. Check SMTP settings.' }));
        }
      } 
      else if (urlPath === '/api/auth/confirm-code') {
        const { email } = data;
        const otp = data.otp || data.code;
        const stored = otps.get(email);

        if (!stored) {
          res.writeHead(400);
          return res.end(JSON.stringify({ success: false, error: 'No OTP requested for this email' }));
        }
        if (Date.now() > stored.expiresAt) {
          otps.delete(email);
          res.writeHead(400);
          return res.end(JSON.stringify({ success: false, error: 'OTP expired' }));
        }
        if (stored.code !== otp) {
          res.writeHead(400);
          return res.end(JSON.stringify({ success: false, error: 'Invalid OTP' }));
        }

        otps.delete(email); // consume it
        res.writeHead(200);
        res.end(JSON.stringify({ success: true }));
      }
      
        else if (urlPath === '/api/admin/send-email') {
          const { to, subject, body } = data;
          if (!to || !subject || !body) {
            res.writeHead(400);
            return res.end(JSON.stringify({ success: false, error: 'Missing to, subject or body' }));
          }
          try {
            await transporter.sendMail({
              from: process.env.SMTP_FROM || '"SJC Counselling" <sjc.counselling.anuradhapura@gmail.com>',
              to,
              subject,
              text: body
            });
            res.writeHead(200);
            res.end(JSON.stringify({ success: true }));
          } catch (e) {
            console.error('[Admin Email Error]', e);
            res.writeHead(500);
            res.end(JSON.stringify({ success: false, error: 'Failed to send email' }));
          }
        }
        else if (urlPath === '/api/schedule-appointment') {
        const { email, name, date, time, notes, type } = data;
        if (!email) {
          res.writeHead(400);
          return res.end(JSON.stringify({ success: false, error: 'Student email is required.' }));
        }

        try {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || '"SJC Counselling" <sjc.counselling.anuradhapura@gmail.com>',
            to: email,
            subject: `Update on your Counselling Appointment`,
            html: `
              <h3>SJC Counselling & Guidance Unit</h3>
              <p>Dear ${name},</p>
              <p>Your appointment for <strong>${type}</strong> has been scheduled.</p>
              <p><strong>Date:</strong> ${date}</p>
              <p><strong>Time:</strong> ${time}</p>
              ${notes ? `<p><strong>Note from Counsellor:</strong> ${notes}</p>` : ''}
              <br>
              <p>Duty First Since 1898.</p>
            `
          });
          res.writeHead(200);
          res.end(JSON.stringify({ success: true }));
        } catch (mailErr) {
          console.error('[Schedule Email Error]', mailErr);
          res.writeHead(500);
          res.end(JSON.stringify({ success: false, error: 'Failed to send email. Check SMTP settings.' }));
        }
      }
      else {
        res.writeHead(404);
        res.end(JSON.stringify({ success: false, error: 'Not found' }));
      }
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ success: false, error: 'Server error' }));
    }
  });
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  
  if ((req.method === 'POST' || req.method === 'OPTIONS') && urlPath.startsWith('/api/')) {
    return handleApiRequest(req, res, urlPath);
  }

  if (urlPath === '/') urlPath = '/index.html';
  
  // Clean URL support
  if (!path.extname(urlPath)) {
    if (fs.existsSync(path.join(__dirname, urlPath + '.html'))) {
      urlPath = urlPath + '.html';
    } else if (fs.existsSync(path.join(__dirname, urlPath, 'index.html'))) {
      urlPath = path.join(urlPath, 'index.html');
    }
  }

  let filePath = path.join(__dirname, urlPath);

  // If path is a directory, serve its index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(__dirname, 'index.html'), (err404, content404) => {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(content404);
        });
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + err.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      res.end(content);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at port ${PORT}`);
});

