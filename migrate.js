const fs = require('fs');
const path = require('path');

async function main() {
    const migrations = fs.readdirSync('./migrations');

    for(let mig of migrations) {
        const fp = path.join(__dirname, './migrations', mig);
        console.log(`Running ${mig}...`);
        const migrate = require(fp);
        await migrate();
    }
}

main();