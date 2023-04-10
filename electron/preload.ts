import { generateContextBridge } from "@el3um4s/ipc-for-electron";
import systemInfo from "@el3um4s/ipc-for-electron-system-info";

import updaterInfo from "./IPC/updaterInfo";

//IPC에서 정의한 것을 여기서 가져와서 다리역할을 함
import dataGenerator from "./IPC/dataGenerator";
import daq from "./IPC/daq";

generateContextBridge([systemInfo, updaterInfo, dataGenerator, daq], "ipc");
