import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import paramiko

HOST = '43.228.213.111'
USER = 'root'
PASS = 'jake134'

print('Connecting to VPS...')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, 22, USER, PASS, timeout=30)
print('✓ Connected.')

sftp = ssh.open_sftp()

# Deploy security-critical files
files = [
    (r'D:\Sjc\server.js', '/var/www/sjc/server.js', 'Backend with security hardening'),
    (r'D:\Sjc\security-client.js', '/var/www/sjc/security-client.js', 'Client-side security utilities'),
    (r'D:\Sjc\admin\index.html', '/var/www/sjc/admin/index.html', 'Admin panel with security'),
    (r'D:\Sjc\teacher\index.html', '/var/www/sjc/teacher/index.html', 'Teacher panel with security'),
    (r'D:\Sjc\SECURITY.md', '/var/www/sjc/SECURITY.md', 'Security documentation'),
    (r'D:\Sjc\.env.example', '/var/www/sjc/.env.example', 'Environment config template'),
]

for local, remote, desc in files:
    try:
        sftp.put(local, remote)
        print(f'✓ Deployed {desc}')
    except Exception as e:
        print(f'✗ Error deploying {desc}: {e}')

sftp.close()

# Restart server and verify
print('\nRestarting server...')
cmds = [
    'pm2 restart sjc-cgu',
    'pm2 save',
    'sleep 3 && curl -s -o /dev/null -w "HTTP %{http_code}\\n" https://cgu.jakenetwork.xyz/admin/',
]

for c in cmds:
    stdin, stdout, stderr = ssh.exec_command(c)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    if out:
        print(f'  {out}')
    if err and 'warn' not in err.lower():
        print(f'  ERR: {err}')

ssh.close()
print('\n✓ Security hardening deployed to https://cgu.jakenetwork.xyz/')
print('→ Configure .env file on VPS with ADMIN_EMAIL, GMAIL_USER, GMAIL_PASS')
print('→ See SECURITY.md for complete security architecture')
