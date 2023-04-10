const fs = require('fs');
const file_Path = "C:/Users/dudal/test/index.txt";

let fileData = [];

for (let i = 0; i <= 200; i++) {
  const buffer = Buffer.alloc(8);
  buffer.writeDoubleLE(i); 
  fileData.push(buffer);
  console.log(buffer)
}

const file_w = fs.createWriteStream(file_Path, {
  flags: "w",
});

file_w.on("error", function(){
  consolo.log("write error")
});


fileData.forEach((buffer) => file_w.write(buffer));
console.log("write file")
file_w.end();
//----------------------------------------------------------------------//
const file_r = fs.createReadStream(file_Path,{
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

// readFile(file_Path)
//   .then((data) => {
//     console.log(data);
//   })
//   .catch((err) => {
//     console.error(err);
// });


// for (let i = 0; i < 100; i++) {
//   const offset = i * 8;
//   const value = sampleData.writeDoubleLE(offset);
//   console.log("??",value)
//   arrayData.push(value);
// }

// arrayData.forEach((value) => console.log(value))

// arrayData.forEach((value) => console.log(value) )

// const directoryPath = "C:/Users/dudal/test";


// async function deleteFile(filePath ) {
//     try {
//       await unlink(filePath);
//       console.log(`File deleted: ${filePath}`);
//     } catch (error) {
//       console.error(`Error deleting file: ${error}`);
//     }
    
// }

// async function fileExists(filePath ) {
//     try {
//       await access(filePath);
//       return true;
//     } catch {
//       return false;
//     }
// }

// async function writeToFile(filePath , data) {
//     try {
//       // Check if the file already exists
//       if (await fileExists(filePath)) {
//         await deleteFile(filePath);
//       }
//       // Write data to file
//       await writeFile(filePath, little_data);
//       console.log(`Data written to file: ${filePath}`);
//     } catch (error) {
//       console.error(`Error writing data to file: ${error}`);
//     }
// }

// writeToFile(file_Path,data); // Call the function to write the data to the file

let fileBuffer = [];

for (let ch =0 ; ch < 4 ; ch++){
  for(let i = 0 ; i<100 ; i++){
    fileBuffer[ch].push(i);
  }

  const file_w = fs.createWriteStream("" ,{
    flags:'w'
  })

  fileBuffer[ch].forEach((buffer) => file_w.write(buffer))


}
//fsfsdafsafsda