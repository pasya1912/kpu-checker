const https = require('https');
const fs = require('fs');
const readlineSync = require('readline-sync');

async function getTpsKelurahan(prov, kota, kecamatan, kelurahan) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'sirekap-obj-data.kpu.go.id',
            path: `/wilayah/pemilu/ppwp/${prov}/${kota}/${kecamatan}/${kelurahan}.json`,
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'max-age=0',
                'Connection': 'keep-alive',
                'Cookie': '_gid=GA1.3.892451691.1708065271; _ga=GA1.1.1201254762.1707998431; _ga_K51LBJNM4Z=GS1.1.1708065271.1.1.1708065301.0.0.0; _ga_JWWVFX0SJ1=GS1.1.1708145017.4.1.1708145438.0.0.0',
                'If-Modified-Since': 'Fri, 16 Feb 2024 02:30:49 GMT',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
                'sec-ch-ua': '"Not A(Brand";v="99", "Microsoft Edge";v="121", "Chromium";v="121"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"'
            }
        };

        const req = https.get(options, function (res) {
            const chunks = [];

            res.on('data', function (chunk) {
                chunks.push(chunk);
            });

            res.on('end', function () {
                const body = Buffer.concat(chunks);

                try {
                    const result = JSON.parse(body.toString());

                    if (result) {
                        resolve(result);
                    } else {
                        reject(body.toString());
                    }
                } catch (e) {
                    reject(body.toString());
                }
            });
        });
    });
}

function getData(prov, kota, kecamatan, kelurahan, kodeTps) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'sirekap-obj-data.kpu.go.id',
            path: `/pemilu/hhcw/ppwp/${prov}/${kota}/${kecamatan}/${kelurahan}/${kodeTps}.json`,
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'max-age=0',
                'Connection': 'keep-alive',
                'Cookie': '_gid=GA1.3.892451691.1708065271; _ga=GA1.1.1201254762.1707998431; _ga_K51LBJNM4Z=GS1.1.1708065271.1.1.1708065301.0.0.0; _ga_JWWVFX0SJ1=GS1.1.1708145017.4.1.1708145438.0.0.0',
                'If-Modified-Since': 'Fri, 16 Feb 2024 02:30:49 GMT',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
                'sec-ch-ua': '"Not A(Brand";v="99", "Microsoft Edge";v="121", "Chromium";v="121"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"'
            }
        };

        const req = https.get(options, function (res) {
            const chunks = [];

            res.on('data', function (chunk) {
                chunks.push(chunk);
            });

            res.on('end', function () {
                const body = Buffer.concat(chunks);
                try {
                    const result = JSON.parse(body.toString());
                    if (result) {
                        resolve(result);
                    } else {
                        reject(body.toString());
                    }
                } catch (e) {
                    reject(body.toString());
                }

            });
        });
    });
}
function saveResult(data,filename){
    const filePath = filename;
    const dataToAppend = data + "\n";

    try {
        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            // If the file does not exist, create a new one
            fs.writeFileSync(filePath, '', { flag: 'a' });
        }

        // Append data to the file
        fs.appendFileSync(filePath, dataToAppend);

        console.log('Data appended successfully.');
    } catch (err) {
        console.error('Error appending data to file:', err);
    }
}

async function deleteDuplicateLines(filename) {
    try {
        // Read the contents of the file
        const data = await fs.promises.readFile(filename, 'utf8');

        // Split the contents into lines
        const lines = data.split('\n');

        // Create a set to store unique lines
        const uniqueLines = new Set();

        // Add each line to the set
        lines.forEach(line => {
            uniqueLines.add(line);
        });

        // Convert the set back to an array of lines
        const uniqueLinesArray = Array.from(uniqueLines);

        // Join the lines back together
        const newData = uniqueLinesArray.join('\n');

        // Write the unique lines back to the file
        await fs.promises.writeFile(filename, newData);

    } catch (err) {
        console.error('Error:', err);
    }
}


function isFraud(data) {

    if (!data.chart) {
        console.log("Data masih diproses...");
        return 0;
    }

    let anis = data.chart["100025"];
    let prabowo = data.chart["100026"];
    let ganjar = data.chart["100027"];
    if (data.administrasi == null) {
        console.log("Data administrasi belum diproses tapi jumlah suara sudah muncul");
        console.log("Anis: " + anis);
        console.log("Prabowo: " + prabowo);
        console.log("Ganjar: " + ganjar);
        console.log("Total: " + (anis + prabowo + ganjar))
        console.log("Suara Sah: Masih diproses");


        return 2;
    }


    let suaraSah = data.administrasi.suara_sah;

    if (anis + prabowo + ganjar != suaraSah ) {
        console.log("Terdapat perbedaan data !");
        console.log("Anis: " + anis);
        console.log("Prabowo: " + prabowo);
        console.log("Ganjar: " + ganjar);
        console.log("Total: " + (anis + prabowo + ganjar))
        console.log("Suara Sah: " + suaraSah);
        return 1;
    }
    else {
        console.log("Data Cocok dengan Suara Sah");
        return 0;
    }
}
(async () => {
    var url;
    const pattern = /^https:\/\/pemilu2024\.kpu\.go\.id\/pilpres\/hitung-suara\/(\d+)\/(\d+)\/(\d+)\/(\d+)\/?$/;
    askForUrl: while (true) {
        url = readlineSync.question("Link KPU Kelurahan(cth: https://pemilu2024.kpu.go.id/pilpres/hitung-suara/33/3329/332915/3329152004/3329152004006): ");

        if (pattern.test(url)) {
            break askForUrl;
        } else {
            console.log("URL tidak valid !");
            continue askForUrl;
        }

    }
    const match = pattern.exec(url);
    const provinsi = match[1];
    const kota = match[2];
    const kecamatan = match[3];
    const kelurahan = match[4];


    try {
        const result = await getTpsKelurahan(provinsi, kota, kecamatan, kelurahan);
        console.log("Terdapat " + result.length + " Tps");

        // Define the batch size
        const batchSize = 30;

        // Function to process a batch of promises
        const processBatch = async (batch) => {
            return Promise.all(batch.map(async (tps) => {
                console.log("===========");
                console.log(tps.nama);
                let frauded = isFraud(await getData(provinsi, kota, kecamatan, kelurahan, tps.kode));
                if (frauded) {
                    switch(frauded)
                    {
                        case 1:
                            saveResult("https://pemilu2024.kpu.go.id/pilpres/hitung-suara/" + provinsi + "/" + kota + "/" + kecamatan + "/" + kelurahan + "/" + tps.kode,'tidakCocok.txt');
                        case 2:
                            saveResult("https://pemilu2024.kpu.go.id/pilpres/hitung-suara/" + provinsi + "/" + kota + "/" + kecamatan + "/" + kelurahan + "/" + tps.kode,'belumProsesSudahResult.txt');
                        default:

                        break;
                    }
                }
                console.log("===========");
            }));
        };

        // Process the promises in batches
        for (let i = 0; i < result.length; i += batchSize) {
            const batch = result.slice(i, i + batchSize);
            await processBatch(batch);
        }
        deleteDuplicateLines('tidakCocok.txt');
        deleteDuplicateLines('belumProsesSudahResult.txt');
        console.log("Proses Pengecekan selesai...")
        readlineSync.question("Tekan tombol apapun untuk selesai");
    } catch (e) {
        console.log("Error: ", e);
    }
})();
