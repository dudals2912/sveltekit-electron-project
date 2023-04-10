import { IPC, SendChannels } from "@el3um4s/ipc-for-electron";
import { BrowserWindow } from "electron";
import { access, writeFile, mkdir, readFile, unlink } from "fs/promises";
import ffi from "ffi-napi";
import path from "path";
import ref from "ref-napi";
import _ from "lodash";
import { channel } from "diagnostics_channel";
import { type } from "os";

const fs = require("fs");

let dll_path;
//process.env -> Node js앰이 동작할 리눅스/유닉스 시스템의 환경변수를 이용
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV?.includes("development")) {
  dll_path = path.join(__dirname, "../natives/NIDAQLib.dll");
} else {
  dll_path = path.join(__dirname, "../../../natives/NIDAQLib.dll");
}
console.log(dll_path);

//native를 이용해 함수 가져오기
const daqLib = ffi.Library(dll_path, {
  CreateTask: ["void", ["int", "pointer", "int"]],
  Init: ["void", ["int", "int", "pointer", "pointer"]],
  StartTask: ["void", []],
  SetProcessFlag: ["void", ["bool"]],
  StopTask: ["void", []],
  DestroyTask: ["void", []],
});

const nameAPI = "daq";

// to Main -> 값을 전달(send)할 채널의의 함수를 정의
const validSendChannel: SendChannels = {
  createTask: createTask,
  init: init,
  startTask: startTask,
  stopTask: stopTask,
  destroyTask: destroyTask,
};

// from Main -> Svelte로 보낼(send) 채널을 설정
const validReceiveChannel: string[] = ["getData"];

const daq = new IPC({
  nameAPI,
  validSendChannel,
  validReceiveChannel,
});

//preload로 연결하는 이름 설정
export default daq;
/*-------------------------------------------------------------------------------------------------*/

async function createTask(
  mainWindow: BrowserWindow,
  event: Electron.IpcMainEvent,
  params: {
    sensorType: number;
    inChannels: number[];
  }
) {
  let { sensorType, inChannels } = params;

  console.log(inChannels);
  nChannels = inChannels.length; //inChnnels(사용할 채널), nChannel(총 채널 개수) 의미
  const channelsPtr = Buffer.alloc(inChannels.length * 4);
  for (let i = 0; i < inChannels.length; i++) {
    channelsPtr.writeInt32LE(inChannels[i], i * 4);
  }
  console.log(channelsPtr);

  daqLib.CreateTask(
    sensorType,
    channelsPtr as ref.Pointer<number>,
    inChannels.length
  );
  console.log("CreateTask");
}

//data 관련 변수
var sum_ch: number[] = [];
let buffer: Buffer;
let nChannels: number;
let samplingRate: number;
let nSamples: number;
let storageInterval: number;
let originSetupTime: number;
let setupTime: number;

//Samples(1ch~nch)
let fileBuffer: any = [];
let fileData: Buffer;
let channelCheck: boolean[] = [];
let thresData: number[] = [];
let thresFileData: Buffer;
let thresBuffer: any = [];
// let thresBufferLength: number[] = [];
let fileTimePlus: number = 0;

//file 관련 변수
let file_Path: string;
let Tfile_Path: string;
let file_Base_Path: string;
let Tfile_Base_Path: string;
let directory_Path: string;

//file write 관련 변수
//Header(fid, nch, fs, nsamp, nbit, minval, maxval)
const datFormat = {
  fid: Buffer.alloc(4),
  nch: Buffer.alloc(4),
  fs_: Buffer.alloc(4),
  nsamp: Buffer.alloc(4),
  nbit: Buffer.alloc(4),
  minval: Buffer.alloc(8),
  maxval: Buffer.alloc(8),
};

const { fid, nch, fs_, nsamp, nbit, minval, maxval } = datFormat;

function callback(event: Electron.IpcMainEvent) {
  const sum = [0, 0, 0, 0];
  const y_data: number[][] = [];
  const x_data: number[] = [];

  //x_data -> 가로선 25600개를 세부적으로 -1~1안에 맞도록 규격을 짬
  for (let i = 0; i < nSamples; i++) {
    x_data.push(i / samplingRate);
  }
  //y_data -> 세로선 25600개의 데이터를 세부적으로 -1~1안에 맞도록 채널별로 규격을 짬
  for (let ch = 0; ch < nChannels; ch++) {
    y_data.push([]);
    for (let i = 0; i < nSamples; i++) {
      y_data[ch].push(buffer.readDoubleLE(ch * 8 * nSamples + i * 8));
      sum[ch] += y_data[ch][i];

      //raw data
      fileData = Buffer.alloc(8);
      fileData.writeDoubleLE(y_data[ch][i]);
      if (!fileBuffer[ch]) {
        fileBuffer[ch] = [];
      }
      fileBuffer[ch].push(fileData);

      //thres data
      thresFileData = Buffer.alloc(8);
      if (y_data[ch][i] > thresData[ch] / 100) {
        thresFileData.writeDoubleLE(y_data[ch][i]);
        if (!thresBuffer[ch]) {
          thresBuffer[ch] = [];
        }
        thresBuffer[ch].push(thresFileData);
      }
    }

    sum_ch.push(sum[ch] / samplingRate);
    console.log(`channel_test ${ch}: ${sum[ch] / samplingRate}`);
  }

  file_Path = `${file_Base_Path}${fileTimePlus}.txt`;
  Tfile_Path = `${Tfile_Base_Path}${fileTimePlus}.txt`;

  //Raw write
  fid.writeInt32LE(0);
  nch.writeInt32LE(nChannels);
  fs_.writeInt32LE(samplingRate);
  nsamp.writeInt32LE(nSamples);
  nbit.writeInt32LE(8);
  minval.writeDoubleLE(-15);
  maxval.writeDoubleLE(15);

  //Write file function
  function writeToFile(path: string, fileBufferlist: any = []) {
    const file_w = fs.createWriteStream(path, {
      flags: "w",
    });

    file_w.on("error", function () {
      console.log("write error");
    });

    file_w.write(fid);
    file_w.write(nch);
    file_w.write(fs_);
    file_w.write(nsamp);
    file_w.write(nbit);
    file_w.write(minval);
    file_w.write(maxval);

    for (let ch = 0; ch < nChannels; ch++) {
      if (channelCheck[ch]) {
        fileBufferlist[ch].forEach((buffer: Buffer) => file_w.write(buffer));
      }
    }

    file_w.on("end", function () {
      console.log("file write end");
    });

    file_w.end();

    fileTimePlus++;
  }

  //file write(data StorageInterval)
  if (storageInterval === 1) {
    writeToFile(file_Path, fileBuffer);
    writeToFile(Tfile_Path, thresBuffer);
  } else {
    if (originSetupTime !== setupTime) {
      if (setupTime % storageInterval === 1) {
        writeToFile(file_Path, fileBuffer);
        writeToFile(Tfile_Path, thresBuffer);
      }
    }
  }

  setupTime--;

  console.log("callback");
  cb;

  //data per channel
  event.sender.send("getData", sum_ch);
  sum_ch.splice(0);
  daqLib.SetProcessFlag(true);

  console.log(file_Path);
}

let cb: any = null;

async function init(
  mainWindow: BrowserWindow,
  event: Electron.IpcMainEvent,
  //Init은 매개변수가 3개
  //params 매개변수에 send를 보내어 svelte의 코드와 연결지을 수 있음
  params: {
    inSamplingRate: number;
    inNSamples: number;
    inStorageInterval: number;
    inSetupTime: number;
    inFilePath: string;
    inTfilePath: string;
    indirectoryPath: string;
    inChannelCheck: boolean[];
    inThresData: number[];
  }
) {
  const {
    inSamplingRate,
    inNSamples,
    inStorageInterval,
    inSetupTime,
    inFilePath,
    inTfilePath,
    indirectoryPath,
    inChannelCheck,
    inThresData,
  } = params;

  nSamples = inNSamples;
  samplingRate = inSamplingRate;
  storageInterval = inStorageInterval;
  setupTime = inSetupTime;
  file_Base_Path = inFilePath;
  Tfile_Base_Path = inTfilePath;
  directory_Path = indirectoryPath;
  channelCheck = inChannelCheck;
  thresData = inThresData;

  originSetupTime = setupTime;
  storageInterval += 1;

  buffer = Buffer.alloc(inNSamples * 8 * nChannels);
  console.log(buffer.length);

  // Use a closure to capture the event argument
  cb = ffi.Callback("void", [], () => {
    callback(event);
  });

  daqLib.Init(inSamplingRate, inNSamples, cb, buffer as ref.Pointer<number>);
  console.log("Init");
}

async function startTask(
  mainWindow: BrowserWindow,
  event: Electron.IpcMainEvent,
  params: {}
) {
  daqLib.StartTask();
  console.log("StartTask");
}

async function stopTask(
  mainWindow: BrowserWindow,
  event: Electron.IpcMainEvent,
  params: {}
) {
  daqLib.StopTask();
  console.log("StopTask");

  fileTimePlus = 0;
  fileBuffer.splice(0);
  thresBuffer.splice(0);
}

async function destroyTask(
  mainWindow: BrowserWindow,
  event: Electron.IpcMainEvent,
  params: {}
) {
  daqLib.DestroyTask();
  console.log("DestroyTask");
}

