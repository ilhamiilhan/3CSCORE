import * as ftp from 'basic-ftp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        console.log("🔌 Connecting to FTP server...");
        await client.access({
            host: "3cscore.com",
            user: "cscoreco",
            password: "ilhami.55",
            secure: false // Hosting often uses plain FTP or implicit TLS, try explicit false first or modify if needed
        });

        console.log("✅ Connected!");

        const localDir = path.join(__dirname, 'dist');
        const remoteDir = "public_html";

        // console.log(`📂 Ensuring remote directory exists: ${remoteDir}`);
        // await client.ensureDir(remoteDir);

        console.log("🧹 Clearing remote directory (optional safety check)...");
        // Optional: clear directory? For now, we overwrite. 
        // client.clearWorkingDir(); // Careful with this!

        console.log(`🚀 Uploading files from ${localDir} to ${remoteDir}...`);
        await client.uploadFromDir(localDir, remoteDir);

        console.log("🎉 Deployment successful!");

    } catch (err) {
        console.error("❌ Deployment failed:", err);
    } // finally {
    // client.close(); // let client stay open for verbose logging if needed, but usually good to close
    //}
    client.close();
}

deploy();
