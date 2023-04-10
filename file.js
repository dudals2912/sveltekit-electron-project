const fs = require("fs");

const nChannels = 4;
const nSamples = 25600;
const samplingRate = 25600;

// initialize file buffers for each channel
const fileBuffers = [];
for (let ch = 0; ch < nChannels; ch++) {
  fileBuffers[ch] = Buffer.alloc(nSamples * 8);
}

// fill file buffers with data
for (let ch = 0; ch < nChannels; ch++) {
  for (let i = 0; i < nSamples; i++) {
    fileBuffers[ch].writeDoubleLE(Math.random(), i * 8);
  }
}

// write file buffers to disk
for (let ch = 0; ch < nChannels; ch++) {
  const fileStream = fs.createWriteStream("C:/Users/dudal/test/col.txt", {
    flags: "w",
  });

  fileStream.write(fileBuffers[ch]);
  fileStream.end();
}

const file_r = fs.createReadStream("C:/Users/dudal/test/col.txt",{
    flags:'r'
  });


file_r.on('data', (data) => {
  for (let i = 0; i < data.length; i += 8) {
    const number = data.readDoubleLE(i);
    console.log(number);
  }
});
  file_r.on('end', function () {
    console.log('Finished reading the file.');
  })

  file_r.on('error', function (err) {
    console.error('Error while reading the file:', err);
  });