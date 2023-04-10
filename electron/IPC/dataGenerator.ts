import { IPC, SendChannels } from "@el3um4s/ipc-for-electron";
import { app, BrowserWindow } from "electron";
import { access, writeFile, mkdir, readFile } from "fs/promises";
import path from "path";

const nameAPI = "dataGenerator";

// to Main
const validSendChannel: SendChannels = {
    genSignal: genSignal,
};

// from Main
const validReceiveChannel: string[] = ["getSignal"];

const dataGenerator = new IPC({
    nameAPI,
    validSendChannel,
    validReceiveChannel,
});

export default dataGenerator;

async function genSignal(
    mainWindow: BrowserWindow,
    event: Electron.IpcMainEvent,
    params: {
        signalLength: number,
        frequency: number,
        phase: number
    }
) {
    const signal = [];
    for (let i = 0; i < 360 * params.signalLength; i++) {
        signal.push({
            x: i / 360,
            y: Math.sin(
                ((i * params.frequency) / 360) * 2 * Math.PI + 2 * Math.PI * params.phase
            ),
        });
    }
    //getSignal 채널로 signal의 값을 보냄
    event.sender.send("getSignal", signal);
}
