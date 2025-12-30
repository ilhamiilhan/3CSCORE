import { Client } from 'basic-ftp';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// .env.deploy dosyasını oku
dotenv.config({ path: '.env.deploy' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function deploy() {
    const client = new Client();
    // Detaylı log görmek isterseniz açabilirsiniz
    // client.ftp.verbose = true;

    console.log("🚀 Deploy işlemi başlatılıyor...");

    if (!process.env.FTP_HOST || !process.env.FTP_USER || !process.env.FTP_PASSWORD) {
        console.error('❌ HATA: FTP bilgileri bulunamadı!');
        console.error('Lütfen projenin ana dizininde .env.deploy dosyası oluşturun ve şu bilgileri ekleyin:');
        console.error('FTP_HOST=ftp.site.com');
        console.error('FTP_USER=kullanici_adi');
        console.error('FTP_PASSWORD=sifre');
        console.error('FTP_REMOTE_ROOT=/public_html  (Opsiyonel, varsayılan: /)');
        return;
    }

    try {
        console.log(`🔌 Bağlanılıyor: ${process.env.FTP_HOST}`);

        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            secure: false // Çoğu paylaşımlı hostingde false veya 'explicit' gerekir. Otomatik deneme yapar.
        });

        console.log("✅ FTP Bağlantısı sağlandı.");

        const localDir = path.join(__dirname, 'dist');
        const remoteDir = process.env.FTP_REMOTE_ROOT || '/';

        console.log(`📂 Yerel klasör: ${localDir}`);
        console.log(`☁️  Uzak klasör: ${remoteDir}`);
        console.log("📤 Dosyalar yükleniyor... (Bu işlem internet hızınıza göre sürebilir)");

        // Uzak klasöre git veya oluştur
        await client.ensureDir(remoteDir);

        // Klasörün içini tamamen temizlemek riskli olabilir, sadece üzerine yazıyoruz.
        // Eğer temiz kurulum isterseniz: await client.clearWorkingDir();

        await client.uploadFromDir(localDir, remoteDir);

        console.log("🎉 TEBRİKLER! Deploy başarıyla tamamlandı.");

    } catch (err) {
        console.error("❌ Deploy sırasında bir hata oluştu:", err);
    } finally {
        client.close();
    }
}

deploy();
