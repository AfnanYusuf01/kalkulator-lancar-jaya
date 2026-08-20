const { Client } = require('ssh2');

const conn = new Client();

console.log('Menghubungkan ke VPS 202.155.16.227 untuk Deployment...');

conn.on('ready', () => {
  console.log('✓ Koneksi SSH Berhasil Terhubung.');
  
  // Perintah deployment berurutan
  const cmd = [
    'cd /var/www/kalkulator-lancar-jaya',
    'echo "=== STEP 1: Git Pull ==="',
    'git pull origin main || git pull',
    'echo "=== STEP 2: Npm Install (Backend) ==="',
    'npm install --production',
    'echo "=== STEP 3: Restart PM2 Backend ==="',
    'pm2 restart lancar-jaya-backend',
    'echo "=== STEP 4: Npm Install & Build (Client/Frontend) ==="',
    'cd client',
    'npm install',
    'npm run build',
    'echo "=== DEPLOYMENT SUCCESSFUL ==="'
  ].join(' && ');

  console.log('Menjalankan perintah deployment di server...');
  
  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('✕ Gagal menjalankan deployment:', err);
      conn.end();
      return;
    }
    
    let output = '';
    stream.on('close', (code, signal) => {
      console.log(`\n✓ Deployment selesai dengan kode keluar: ${code}`);
      if (code === 0) {
        console.log('\n🎉 WEBSITE ANDA TELAH BERHASIL DIUPDATE DI VPS!');
      } else {
        console.error('\n⚠️ Terjadi kendala saat deployment. Cek log output di atas.');
      }
      conn.end();
    });
    
    stream.on('data', (data) => {
      console.log(data.toString().trim());
    });
    
    stream.stderr.on('data', (data) => {
      console.error('STDERR:', data.toString().trim());
    });
  });
}).on('error', (err) => {
  console.error('✕ Gagal terhubung SSH:', err.message);
}).connect({
  host: '202.155.16.227',
  port: 22,
  username: 'root',
  password: '%Gc$w8n2km31DW',
  readyTimeout: 20000
});
