const { Client } = require('ssh2');

const conn = new Client();

console.log('Menghubungkan ke server 202.155.16.227...');

conn.on('ready', () => {
  console.log('✓ Koneksi SSH Berhasil Terhubung.');
  
  // Cari folder proyek dan jalankan pm2 list / systemctl status
  const cmd = 'find /var/www /root /home -maxdepth 3 -name "kalkulator*" -o -name "Kalkulator*" -type d 2>/dev/null; echo "---PM2---"; pm2 list 2>/dev/null || systemctl status pm2 2>/dev/null || echo "No PM2"; echo "---NGINX---"; systemctl is-active nginx 2>/dev/null || echo "No Nginx"';
  
  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Gagal menjalankan perintah:', err);
      conn.end();
      return;
    }
    
    let output = '';
    stream.on('close', (code, signal) => {
      console.log('✓ Perintah diagnosa selesai dengan kode:', code);
      console.log('\n===== HASIL DIAGNOSA SERVER =====');
      console.log(output);
      console.log('=================================');
      conn.end();
    });
    
    stream.on('data', (data) => {
      output += data.toString();
    });
    
    stream.stderr.on('data', (data) => {
      console.error('STDERR:', data.toString());
    });
  });
}).on('error', (err) => {
  console.error('✕ Gagal terhubung SSH:', err.message);
}).connect({
  host: '202.155.16.227',
  port: 22,
  username: 'root',
  password: '%Gc$w8n2km31DW',
  readyTimeout: 10000
});
