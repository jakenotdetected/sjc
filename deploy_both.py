import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import paramiko

HOST = '43.228.213.111'
USER = 'root'
PASS = 'jake134'

print('Connecting...')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, 22, USER, PASS, timeout=30)
print('Connected.')

sftp = ssh.open_sftp()
sftp.put(r'D:\Sjc\server.js', '/var/www/sjc/server.js')
print('Uploaded server.js')
sftp.put(r'D:\Sjc\admin\index.html', '/var/www/sjc/admin/index.html')
print('Uploaded admin/index.html')
sftp.close()

cmds = [
    'pm2 restart sjc-cgu',
    'pm2 save',
    'sleep 2 && curl -s -o /dev/null -w "HTTP %{http_code}" https://cgu.jakenetwork.xyz/admin/',
]
for c in cmds:
    stdin, stdout, stderr = ssh.exec_command(c)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    if out: print(out)
    if err and 'warn' not in err.lower(): print('ERR:', err)

ssh.close()
print('Done. Live at https://cgu.jakenetwork.xyz/admin/')
