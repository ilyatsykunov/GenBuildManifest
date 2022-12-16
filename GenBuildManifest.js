const fs = require('fs');

const androidVersion = 1.02;
const androidPath = "C:\\Ilya\\Ritmo\\Rhythm Game\\Saved\\StagedBuilds\\Android_Multi\\RhythmGame\\Content\\Paks";

function GenBuildManifest_Android() {

    const fileName = "BuildManifest-Android" + androidVersion + ".txt";

    const newAndroidVersion = androidVersion + 0.01;
    const newFileName = "BuildManifest-Android" + newAndroidVersion + ".txt";
    let newLines = [];

    const pakFileNames = fs.readdirSync(androidPath);
    const oldManifest = fs.readFileSync(fileName).toString().split("\n");  // Read previous version of the build manifest file

    // Clear the build manifest and add 2 header lines 
    const header = "$NUM_ENTRIES = " + (pakFileNames.length - 1) + "\n" + "$BUILD_ID = Ritmo-Live";
    fs.writeFile(newFileName, header, 'utf8', function (err) {
        if (err) return console.log(err);
    });

    // Add the entries to build manifest
    for (let i = 1; i < pakFileNames.length; i++) {
        const chunkID = pakFileNames[i].match(/\d+/).join('');

        const filesize = fs.statSync(androidPath + "\\" + pakFileNames[i]).size;
        let version = "1.0";
        
        // If this chunk is not new and has been updated - update its version 
        for (let j = 0; j < oldManifest.length; j++) {
            if (oldManifest[j].includes(pakFileNames[i])) {
                const oldFilesize = GetSizeFromLine(oldManifest[j]);
                version = GetVersionFromLine(oldManifest[j]);

                if (parseInt(oldFilesize) != filesize) 
                    version = (parseFloat(version) + 0.01).toString();
            }
        }

        // Store the new line in an array
        const line = FormatLine(pakFileNames[i], filesize, chunkID, version, "Android", newAndroidVersion);
        newLines.push(line);
    }

    // Append all lines to the new manifest file
    SortLines(newLines);
    for (let i = 0; i < newLines.length; i++) {
        // This for some reason eats up half of the first line while the appendFile function doesn't but it messes up the order
        fs.appendFileSync(newFileName, newLines[i], 'utf8', function (err) {
            if (err) return console.log(err);
        });
    }
}

function FormatLine(filename, filesize, chunkID, version, platform, gameVersion) {
    return "\n" + filename + "\t" + filesize + "\t" + version + "\t" + chunkID + "\t" + "/" + platform + gameVersion + "/" + filename;
}

function GetChunkIdFromLine(line) {
    return parseInt(line.split("\t")[0].match(/\d+/).join(''));
}

function GetVersionFromLine(line) {
    return line.split("\t")[2];
}

function GetSizeFromLine(line) {
    return line.split("\t")[1];
}

let SortLines = (lines) => {
    let len = lines.length - 1;
    let swapped;
    do {
        swapped = false;
        for (let i = 0; i < len; i++) {
            if (GetChunkIdFromLine(lines[i]) > GetChunkIdFromLine(lines[i + 1])) {
                let tmp = lines[i];
                lines[i] = lines[i + 1];
                lines[i + 1] = tmp;
                swapped = true;
            }
        }
    } while (swapped);
}

GenBuildManifest_Android();