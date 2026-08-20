const fs = require('fs');
const path = require('path');
const http = require('https');

const urls = [
    "https://cdn-icons-png.flaticon.com/128/1354/1354420.png",
    "https://cdn-icons-png.flaticon.com/128/10741/10741189.png",
    "https://cdn-icons-png.flaticon.com/128/14041/14041561.png",
    "https://cdn-icons-png.flaticon.com/128/13609/13609678.png",
    "https://cdn-icons-png.flaticon.com/128/2075/2075975.png",
    "https://cdn-icons-png.flaticon.com/128/15719/15719383.png",
    "https://cdn-icons-png.flaticon.com/128/15044/15044717.png",
    "https://cdn-icons-png.flaticon.com/128/3693/3693002.png",
    "https://cdn-icons-png.flaticon.com/128/4330/4330213.png",
    "https://cdn-icons-png.flaticon.com/128/2887/2887404.png",
    "https://cdn-icons-png.flaticon.com/128/17050/17050412.png",
    "https://cdn-icons-png.flaticon.com/128/17163/17163412.png",
    "https://cdn-icons-png.flaticon.com/128/9963/9963732.png",
    "https://cdn-icons-png.flaticon.com/128/15321/15321697.png",
    "https://cdn-icons-png.flaticon.com/128/7222/7222062.png",
    "https://cdn-icons-png.flaticon.com/128/2871/2871452.png",
    "https://cdn-icons-png.flaticon.com/128/8055/8055053.png",
    "https://cdn-icons-png.flaticon.com/128/4245/4245464.png",
    "https://cdn-icons-png.flaticon.com/128/10741/10741201.png",
    "https://cdn-icons-png.flaticon.com/128/9937/9937627.png",
    "https://cdn-icons-png.flaticon.com/128/10148/10148916.png",
    "https://cdn-icons-png.flaticon.com/128/17050/17050877.png",
    "https://cdn-icons-png.flaticon.com/128/9974/9974064.png",
    "https://cdn-icons-png.flaticon.com/128/4994/4994261.png",
    "https://cdn-icons-png.flaticon.com/128/3666/3666278.png",
    "https://cdn-icons-png.flaticon.com/128/1197/1197987.png",
    "https://cdn-icons-png.flaticon.com/128/10741/10741221.png",
    "https://cdn-icons-png.flaticon.com/128/10172/10172249.png",
    "https://cdn-icons-png.flaticon.com/128/10234/10234127.png",
    "https://cdn-icons-png.flaticon.com/128/2319/2319877.png",
    "https://cdn-icons-png.flaticon.com/128/9617/9617069.png",
    "https://cdn-icons-png.flaticon.com/128/10161/10161464.png",
    "https://cdn-icons-png.flaticon.com/128/10741/10741115.png",
    "https://cdn-icons-png.flaticon.com/128/9960/9960059.png",
    "https://cdn-icons-png.flaticon.com/128/11786/11786212.png",
    "https://cdn-icons-png.flaticon.com/128/17337/17337477.png",
    "https://cdn-icons-png.flaticon.com/128/6102/6102741.png",
    "https://cdn-icons-png.flaticon.com/128/5492/5492770.png",
    "https://cdn-icons-png.flaticon.com/128/2764/2764351.png",
    "https://cdn-icons-png.flaticon.com/128/10113/10113941.png",
    "https://cdn-icons-png.flaticon.com/128/7342/7342930.png",
    "https://cdn-icons-png.flaticon.com/128/10741/10741217.png",
    "https://cdn-icons-png.flaticon.com/128/9452/9452765.png",
    "https://cdn-icons-png.flaticon.com/128/9960/9960200.png",
    "https://cdn-icons-png.flaticon.com/128/7158/7158447.png",
    "https://cdn-icons-png.flaticon.com/128/2774/2774316.png",
    "https://cdn-icons-png.flaticon.com/128/10234/10234087.png",
    "https://cdn-icons-png.flaticon.com/128/15319/15319741.png",
    "https://cdn-icons-png.flaticon.com/128/2914/2914857.png",
    "https://cdn-icons-png.flaticon.com/128/2885/2885743.png",
    "https://cdn-icons-png.flaticon.com/128/2955/2955729.png",
    "https://cdn-icons-png.flaticon.com/128/7099/7099307.png",
    "https://cdn-icons-png.flaticon.com/128/3165/3165335.png",
    "https://cdn-icons-png.flaticon.com/128/2800/2800435.png",
    "https://cdn-icons-png.flaticon.com/128/4358/4358666.png",
    "https://cdn-icons-png.flaticon.com/128/11190/11190364.png",
    "https://cdn-icons-png.flaticon.com/128/18618/18618580.png",
    "https://cdn-icons-png.flaticon.com/128/2914/2914818.png",
    "https://cdn-icons-png.flaticon.com/128/4448/4448558.png",
    "https://cdn-icons-png.flaticon.com/128/17954/17954229.png",
    "https://cdn-icons-png.flaticon.com/128/2800/2800284.png",
    "https://cdn-icons-png.flaticon.com/128/10148/10148937.png",
    "https://cdn-icons-png.flaticon.com/128/2319/2319890.png",
    "https://cdn-icons-png.flaticon.com/128/10490/10490023.png",
    "https://cdn-icons-png.flaticon.com/128/7098/7098713.png",
    "https://cdn-icons-png.flaticon.com/128/16013/16013984.png",
    "https://cdn-icons-png.flaticon.com/128/5533/5533021.png",
    "https://cdn-icons-png.flaticon.com/128/15249/15249568.png",
    "https://cdn-icons-png.flaticon.com/128/10196/10196459.png",
    "https://cdn-icons-png.flaticon.com/128/14673/14673488.png",
    "https://cdn-icons-png.flaticon.com/128/4431/4431046.png",
    "https://cdn-icons-png.flaticon.com/128/17050/17050442.png",
    "https://cdn-icons-png.flaticon.com/128/2886/2886428.png",
    "https://cdn-icons-png.flaticon.com/128/9080/9080540.png",
    "https://cdn-icons-png.flaticon.com/128/17023/17023310.png",
    "https://cdn-icons-png.flaticon.com/128/2764/2764322.png",
    "https://cdn-icons-png.flaticon.com/128/2759/2759730.png",
    "https://cdn-icons-png.flaticon.com/128/17185/17185701.png",
    "https://cdn-icons-png.flaticon.com/128/9953/9953559.png",
    "https://cdn-icons-png.flaticon.com/128/10741/10741130.png",
    "https://cdn-icons-png.flaticon.com/128/10234/10234168.png",
    "https://cdn-icons-png.flaticon.com/128/10741/10741131.png",
    "https://cdn-icons-png.flaticon.com/128/7221/7221725.png",
    "https://cdn-icons-png.flaticon.com/128/10360/10360493.png",
    "https://cdn-icons-png.flaticon.com/128/10741/10741210.png",
    "https://cdn-icons-png.flaticon.com/128/7315/7315795.png",
    "https://cdn-icons-png.flaticon.com/128/10911/10911696.png",
    "https://cdn-icons-png.flaticon.com/128/8977/8977308.png",
    "https://cdn-icons-png.flaticon.com/128/13610/13610108.png",
    "https://cdn-icons-png.flaticon.com/128/17184/17184655.png",
    "https://cdn-icons-png.flaticon.com/128/17063/17063335.png",
    "https://cdn-icons-png.flaticon.com/128/18912/18912284.png",
    "https://cdn-icons-png.flaticon.com/128/15993/15993420.png",
    "https://cdn-icons-png.flaticon.com/128/10149/10149059.png",
    "https://cdn-icons-png.flaticon.com/128/4784/4784215.png",
    "https://cdn-icons-png.flaticon.com/128/4320/4320260.png",
    "https://cdn-icons-png.flaticon.com/512/1354/1354420.png",
    "https://cdn-icons-png.flaticon.com/512/10741/10741189.png",
    "https://cdn-icons-png.flaticon.com/512/14041/14041561.png",
    "https://cdn-icons-png.flaticon.com/512/13609/13609678.png",
    "https://cdn-icons-png.flaticon.com/512/2075/2075975.png",
    "https://cdn-icons-png.flaticon.com/512/15719/15719383.png",
    "https://cdn-icons-png.flaticon.com/512/15044/15044717.png",
    "https://cdn-icons-png.flaticon.com/512/3693/3693002.png",
    "https://cdn-icons-png.flaticon.com/512/4330/4330213.png",
    "https://cdn-icons-png.flaticon.com/512/2887/2887404.png",
    "https://cdn-icons-png.flaticon.com/512/17050/17050412.png",
    "https://cdn-icons-png.flaticon.com/512/17163/17163412.png",
    "https://cdn-icons-png.flaticon.com/512/9963/9963732.png",
    "https://cdn-icons-png.flaticon.com/512/15321/15321697.png",
    "https://cdn-icons-png.flaticon.com/512/7222/7222062.png",
    "https://cdn-icons-png.flaticon.com/512/2871/2871452.png",
    "https://cdn-icons-png.flaticon.com/512/8055/8055053.png",
    "https://cdn-icons-png.flaticon.com/512/4245/4245464.png",
    "https://cdn-icons-png.flaticon.com/512/10741/10741201.png",
    "https://cdn-icons-png.flaticon.com/512/9937/9937627.png",
    "https://cdn-icons-png.flaticon.com/512/10148/10148916.png",
    "https://cdn-icons-png.flaticon.com/512/17050/17050877.png",
    "https://cdn-icons-png.flaticon.com/512/9974/9974064.png",
    "https://cdn-icons-png.flaticon.com/512/4994/4994261.png",
    "https://cdn-icons-png.flaticon.com/512/3666/3666278.png",
    "https://cdn-icons-png.flaticon.com/512/1197/1197987.png",
    "https://cdn-icons-png.flaticon.com/512/10741/10741221.png",
    "https://cdn-icons-png.flaticon.com/512/10172/10172249.png",
    "https://cdn-icons-png.flaticon.com/512/10234/10234127.png",
    "https://cdn-icons-png.flaticon.com/512/2319/2319877.png",
    "https://cdn-icons-png.flaticon.com/512/9617/9617069.png",
    "https://cdn-icons-png.flaticon.com/512/10161/10161464.png",
    "https://cdn-icons-png.flaticon.com/512/10741/10741115.png",
    "https://cdn-icons-png.flaticon.com/512/9960/9960059.png",
    "https://cdn-icons-png.flaticon.com/512/11786/11786212.png",
    "https://cdn-icons-png.flaticon.com/512/17337/17337477.png",
    "https://cdn-icons-png.flaticon.com/512/6102/6102741.png",
    "https://cdn-icons-png.flaticon.com/512/5492/5492770.png",
    "https://cdn-icons-png.flaticon.com/512/2764/2764351.png",
    "https://cdn-icons-png.flaticon.com/512/10113/10113941.png",
    "https://cdn-icons-png.flaticon.com/512/7342/7342930.png",
    "https://cdn-icons-png.flaticon.com/512/10741/10741217.png",
    "https://cdn-icons-png.flaticon.com/512/9452/9452765.png",
    "https://cdn-icons-png.flaticon.com/512/9960/9960200.png",
    "https://cdn-icons-png.flaticon.com/512/7158/7158447.png",
    "https://cdn-icons-png.flaticon.com/512/2774/2774316.png",
    "https://cdn-icons-png.flaticon.com/512/10234/10234087.png",
    "https://cdn-icons-png.flaticon.com/512/15319/15319741.png",
    "https://cdn-icons-png.flaticon.com/512/2914/2914857.png",
    "https://cdn-icons-png.flaticon.com/512/2885/2885743.png",
    "https://cdn-icons-png.flaticon.com/512/2955/2955729.png",
    "https://cdn-icons-png.flaticon.com/512/7099/7099307.png",
    "https://cdn-icons-png.flaticon.com/512/3165/3165335.png",
    "https://cdn-icons-png.flaticon.com/512/2800/2800435.png",
    "https://cdn-icons-png.flaticon.com/512/4358/4358666.png",
    "https://cdn-icons-png.flaticon.com/512/11190/11190364.png",
    "https://cdn-icons-png.flaticon.com/512/18618/18618580.png",
    "https://cdn-icons-png.flaticon.com/512/2914/2914818.png",
    "https://cdn-icons-png.flaticon.com/512/4448/4448558.png",
    "https://cdn-icons-png.flaticon.com/512/17954/17954229.png",
    "https://cdn-icons-png.flaticon.com/512/2800/2800284.png",
    "https://cdn-icons-png.flaticon.com/512/10148/10148937.png",
    "https://cdn-icons-png.flaticon.com/512/2319/2319890.png",
    "https://cdn-icons-png.flaticon.com/512/10490/10490023.png",
    "https://cdn-icons-png.flaticon.com/512/7098/7098713.png",
    "https://cdn-icons-png.flaticon.com/512/16013/16013984.png",
    "https://cdn-icons-png.flaticon.com/512/5533/5533021.png",
    "https://cdn-icons-png.flaticon.com/512/15249/15249568.png",
    "https://cdn-icons-png.flaticon.com/512/10196/10196459.png",
    "https://cdn-icons-png.flaticon.com/512/14673/14673488.png",
    "https://cdn-icons-png.flaticon.com/512/4431/4431046.png",
    "https://cdn-icons-png.flaticon.com/512/17050/17050442.png",
    "https://cdn-icons-png.flaticon.com/512/2886/2886428.png",
    "https://cdn-icons-png.flaticon.com/512/9080/9080540.png",
    "https://cdn-icons-png.flaticon.com/512/17023/17023310.png",
    "https://cdn-icons-png.flaticon.com/512/2764/2764322.png",
    "https://cdn-icons-png.flaticon.com/512/2759/2759730.png",
    "https://cdn-icons-png.flaticon.com/512/17185/17185701.png",
    "https://cdn-icons-png.flaticon.com/512/9953/9953559.png",
    "https://cdn-icons-png.flaticon.com/512/10741/10741130.png",
    "https://cdn-icons-png.flaticon.com/512/10234/10234168.png",
    "https://cdn-icons-png.flaticon.com/512/10741/10741131.png",
    "https://cdn-icons-png.flaticon.com/512/7221/7221725.png",
    "https://cdn-icons-png.flaticon.com/512/10360/10360493.png",
    "https://cdn-icons-png.flaticon.com/512/10741/10741210.png",
    "https://cdn-icons-png.flaticon.com/512/7315/7315795.png",
    "https://cdn-icons-png.flaticon.com/512/10911/10911696.png",
    "https://cdn-icons-png.flaticon.com/512/8977/8977308.png",
    "https://cdn-icons-png.flaticon.com/512/13610/13610108.png",
    "https://cdn-icons-png.flaticon.com/512/17184/17184655.png",
    "https://cdn-icons-png.flaticon.com/512/17063/17063335.png",
    "https://cdn-icons-png.flaticon.com/512/18912/18912284.png",
    "https://cdn-icons-png.flaticon.com/512/15993/15993420.png",
    "https://cdn-icons-png.flaticon.com/512/10149/10149059.png",
    "https://cdn-icons-png.flaticon.com/512/4784/4784215.png",
    "https://cdn-icons-png.flaticon.com/512/4320/4320260.png"
];

// Extract unique resource basenames (keeping both sizes, storing them in client/public/flaticon/)
const destDir = path.join(__dirname, 'public', 'flaticon');
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

// Helper to download a single file
function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destPath);
        http.get(url, (response) => {
            if (response.statusCode !== 200) {
                file.close();
                fs.unlink(destPath, () => {});
                reject(new Error(`Failed to download: Status ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            file.close();
            fs.unlink(destPath, () => {});
            reject(err);
        });
    });
}

// Download them sequentially/in batches
async function run() {
    console.log(`Starting download of ${urls.length} files to ${destDir}...`);
    const uniqueUrls = Array.from(new Set(urls));
    console.log(`Unique URLs count: ${uniqueUrls.length}`);
    
    let success = 0;
    let failed = 0;

    for (let i = 0; i < uniqueUrls.length; i++) {
        const url = uniqueUrls[i];
        
        // Parse original ID and resolution size
        // e.g. https://cdn-icons-png.flaticon.com/512/1354/1354420.png
        const parts = url.split('/');
        const size = parts[3]; // '128' or '512'
        const id = parts[parts.length - 1]; // '1354420.png'
        
        // Save as id_size.png (e.g. 1354420_512.png) or if we just want it named simply
        const filename = `${id.split('.')[0]}_${size}.png`;
        const destPath = path.join(destDir, filename);

        try {
            await downloadFile(url, destPath);
            success++;
        } catch (err) {
            console.error(`Error downloading ${url}:`, err.message);
            failed++;
        }
    }

    console.log(`Downloaded completed. Success: ${success}, Failed: ${failed}`);
}

run();
