import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('43.228.213.111', 22, 'root', 'jake134', timeout=30)
print('Connected.')

sftp = ssh.open_sftp()
for f in ['wellness.html', 'school.html', 'uni-details.html']:
    sftp.put(r'D:\Sjc\\' + f, '/var/www/sjc/' + f)
    print('Uploaded', f)
sftp.close()

for name in ['wellness', 'school', 'uni-details']:
    _, out, _ = ssh.exec_command(f'curl -s -o /dev/null -w "HTTP %{{http_code}}" https://cgu.jakenetwork.xyz/{name}.html')
    print(f'{name}: {out.read().decode().strip()}')
ssh.close()
print('Done.')
