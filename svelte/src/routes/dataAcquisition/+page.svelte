<script lang="ts">
	//createTask 등록 -> [start] -> init(cb) -> starttask -> [stop] -> stoptask
	import { onDestroy, onMount } from 'svelte';

	let signalLength = 1;
	let samplingRate = 25600;
	let isRunning: boolean = false;
	let nSamples: number;
	let getData: number[] = [];

	let event_check: boolean = false;
	let channel_check: boolean[] = [false, false, false, false];

	//데이터 저장
	//데이터 저장 간격 보류
	let storageInterval: number = 0;
	let storage_check: boolean[] = [false, false];

	//데이터 수집 시간
	let setupTime: number = 0;

	let intervalId: any;
	let time = { hour: 0, minute: 0, second: 0, millisecond: 0 };
	let running = false;

	const channels: number[] = [0, 1, 2, 3];
	const sensorType: number = 0;

	let thresData: number[] = [0, 0, 0, 0];

	let daq: any;
	let directory_Path: string = 'C:/Users/dudal/test';
	let file_Base_Path: string = `${directory_Path}/rawdata`;
	let Tfile_Base_Path: string = `${directory_Path}/thresdata`;

	$: {
		nSamples = signalLength * samplingRate;
	}

	//send("함수", {매개변수})
	//receive("채널",(매개변수))
	$: {
		if (isRunning) {
			//electron으로 사용할 변수의 값을 send
			daq?.send('init', {
				inSamplingRate: samplingRate,
				inNSamples: nSamples,
				inStorageInterval: storageInterval,
				inSetupTime: setupTime,
				inFilePath: file_Base_Path,
				inTfilePath: Tfile_Base_Path,
				indirectoryPath: directory_Path,
				inChannelCheck: channel_check,
				inThresData: thresData
			});
			daq?.send('startTask', {});
			startTimer();
		} else {
			daq?.send('stopTask', {});
			stopTimer();
		}
	}

	onMount(async () => {
		try {
			daq = globalThis['ipc' as keyof typeof globalThis]['daq'];
		} catch (error) {
			console.error(error);
			daq = null;
		}

		//반복적으로 작동 eletron의 for문
		daq?.send('createTask', { sensorType, inChannels: channels });

		//createTask 안에 있는 Channel electron의 for문 작동
		daq?.receive('getData', (data: number[]) => {
			getData = data;
		});
	});

	onDestroy(async () => {
		daq?.send('stopTask', {});
		daq?.send('destoryTask', {});
	});

	async function StartButtonClick() {
		isRunning = !isRunning;
	}

	// 데이터 수집 시간
	const startTimer = () => {
		if (!running) {
			time = { hour: 0, minute: 0, second: 0, millisecond: 0 };
			intervalId = setInterval(() => {
				time.millisecond++;
				if (time.millisecond === 250) {
					time.millisecond = 0;
					time.second++;
				}
				if (time.second === 60) {
					time.second = 0;
					time.minute++;
				}
				if (time.minute === 60) {
					time.minute = 0;
					time.hour++;
				}
			}, 1);
			running = true;
		} else {
			clearInterval(intervalId);
			time = { hour: 0, minute: 0, second: 0, millisecond: 0 };
			intervalId = setInterval(() => {
				time.millisecond++;
				if (time.millisecond === 250) {
					time.millisecond = 0;
					time.second++;
				}
				if (time.second === 60) {
					time.second = 0;
					time.minute++;
				}
				if (time.minute === 60) {
					time.minute = 0;
					time.hour++;
				}
			}, 1);
		}
	};

	const stopTimer = () => {
		clearInterval(intervalId);
		running = false;
	};

	const formatTime = (time: any) => {
		const formattedHour = time.hour.toString().padStart(2, '0');
		const formattedMinute = time.minute.toString().padStart(2, '0');
		const formattedSecond = time.second.toString().padStart(2, '0');
		const formattedMillisecond = time.millisecond.toString().padStart(2, '0');
		return `${formattedHour}:${formattedMinute}:${formattedSecond}:${formattedMillisecond}`;
	};
	//
</script>

<svelte:head>
	<title>Acquistion</title>
	<meta name="Acquisition" content="collect data" charset="UTF-8" />
</svelte:head>

<header>
	<picture class="Main_logo">
		<img src="Predict_logo.png" alt="logo" />
	</picture>
</header>

<!-- 데이터 수집 시작, 멈춤 버튼 -->
<div class="Common_div Head-div">
	<table>
		<tr>
			<td class="Head-logo">
				<img src="play_circle.png" alt="start" />
			</td>
			<td class="Head-button">
				<input
					type="button"
					value={isRunning ? '취득중지' : '취득시작'}
					on:click={StartButtonClick}
				/>
			</td>
		</tr>
	</table>
</div>

<!-- 데이터 수집 설정 [R1] -->
<div>
	<table class="Common_div Acquisition-div">
		<thead>
			<tr class="Common_setup Acquisition-setup ">
				<th> 데이터 수집 설정 </th>
			</tr>
		</thead>
		<tr class="Acquisition-border">
			<th class="pt-[52px]" />
		</tr>
		<tbody>
			<tr class="Acquision-table-tr1">
				<td class="pt-[14px] pl-[29px]"> 샘플링 율 (kHz, 1~1000) </td>
				<td class="pt-[14px]">신호 길이 (초,0.01~60)</td>
				<td class="pt-[14px]">데이터 저장간격(초)</td>
				<td class="pt-[14px]">취득 시간</td>
			</tr>
			<tr class="pt-[91px] ">
				<td class="pl-[29px] pt-[7px] pb-[19px]">
					<input class="Acquision-table-tr2  " type="number" bind:value={samplingRate} />
				</td>
				<td class=" pt-[7px] pb-[19px]">
					<input class="Acquision-table-tr2" type="number" bind:value={signalLength} />
				</td>
				<td class=" pt-[7px] pb-[19px]">
					<input class="Acquision-table-tr2" type="number" bind:value={storageInterval} />
				</td>
				<td class=" pt-[7px] pb-[19px]">
					<input class="Acquision-table-tr2" type="number" bind:value={setupTime} />
				</td>
			</tr>
		</tbody>
	</table>

	<!-- 채널 설정 [R2] -->
	<table class="Common_div Channel-div">
		<thead>
			<tr class="Common_setup Channel-setup">
				<th> 채널 설정</th>
			</tr>
		</thead>
		<tr class="Acquisition-border">
			<th class="pt-[47px]" />
		</tr>

		<!-- 이벤트 사용과 채널[i] [R2-1] -->
		<tbody>
			<tr>
				<td class="Channel-external-td pt-[14px]">
					이벤트 사용
					<input class="Check-button" type="checkbox" bind:checked={event_check} />
				</td>
				{#each channels as index}
					<td class="Channel-internal-td pt-[14px]">
						<label class="text-white text-[14px]">
							채널{index}
						</label>
						<input class="Check-button" type="checkbox" bind:checked={channel_check[index]} />
					</td>
				{/each}
			</tr>

			<!-- 이벤트 임계치 설정[i] [R2-2] -->
			<tr>
				<td class="Channel-external-td pt-[20px]"> 이벤트 임계치 (0~50g): </td>

				{#each channels as index}
					<td class="Channel-internal-td pt-[20px]">
						<label>
							{#if event_check == true}
								<input
									class="Channel-table-tr"
									bind:value={thresData[index]}
									type="number"
									step="0.1"
									disabled={!event_check || !channel_check[index]}
								/>
							{:else}
								<input
									class="Channel-table-tr"
									type="number"
									disabled={!event_check || !channel_check[index]}
								/>
							{/if}
						</label>
					</td>
				{/each}
			</tr>

			<!-- 현재 Peak 값 설정[i] [R2-3] -->
			<tr>
				<td class="Channel-external-td pt-[26px] pb-[21px]"> 현재 Peak 값 (g): </td>
				{#each channels as index}
					<td class="Channel-internal-td pt-[26px] pb-[21px]">
						<label>
							{#if channel_check[index] == false}
								<input class="Channel-table-tr " disabled={!channel_check[index]} />
							{:else if channel_check[index] == true && getData[index] > thresData[index] / 100 && event_check == true}
								<input
									class="Channel-table-tr-thres"
									bind:value={getData[index]}
									disabled={!channel_check[index]}
								/>
							{:else}
								<input
									class="Channel-table-tr"
									bind:value={getData[index]}
									disabled={!channel_check[index]}
								/>
							{/if}
						</label>
					</td>
				{/each}
			</tr>
		</tbody>
	</table>

	<!-- 데이터 저장 경로 [R3] -->
	<table class="Common_div Storage-div">
		<thead>
			<tr class="Common_setup Storage-setup">
				<th> 데이터 저장 경로 </th>
			</tr>
		</thead>
		<tr class="Acquisition-border">
			<th class="pt-[52px]" />
		</tr>
		<tbody>
			<tr>
				<td class="Storage-td pt-[20px]">
					Raw 데이터 저장 경로
					<input class="Check-button" type="checkbox" bind:checked={storage_check[0]} />
					<label>
						{#if storage_check[0] == false}
							<input class="Storage-route" type="text" placeholder={file_Base_Path} disabled />
							<button
								class=" Storage-button  "
								style="background-image: url('folder_open.png');"
							/>
						{:else}
							<input
								class="Storage-route"
								type="text"
								bind:value={file_Base_Path}
								disabled={!storage_check[0]}
							/>
							<button
								class="Storage-button bg-center rounded-full"
								style="background-image: url('folder_open.png');"
							/>
						{/if}
					</label>
				</td>
			</tr>
			<tr>
				<td class="Storage-td pt-[26px]">
					이벤트 데이터 저장 경로
					<input class="Check-button" type="checkbox" bind:checked={storage_check[1]} />
					<label>
						{#if storage_check[1] == false}
							<input class="Storage-route" type="text" placeholder={Tfile_Base_Path} disabled />
						{:else}
							<input
								class="Storage-route"
								type="text"
								bind:value={Tfile_Base_Path}
								disabled={!storage_check[1]}
							/>
						{/if}
					</label>
				</td>
			</tr>
		</tbody>
	</table>
</div>

<div>
	<div class="Common_footer-div Footer-div-Time">
		<table>
			<tr>
				<td class="absolute pl-[162px] pt-[17px]">
					<picture>
						<img src="alarm_on.png" alt="time" />
					</picture>
				</td>
				<td
					class="pl-[194px] pt-[17px]
				text-[14px] text-white"
				>
					취득시간: {formatTime(time)}</td
				>
			</tr>
		</table>
	</div>
	<div class="Common_footer-div Footer-div-Error">
		<table>
			<tr>
				<td class="absolute pl-[162px] pt-[17px]">
					<picture>
						<img src="error_circle_rounded.png" alt="error" />
					</picture>
				</td>
				<td
					class="pl-[194px] pt-[17px]
				text-[14px] text-white"
				>
					오류 메세지 확인</td
				>
			</tr>
		</table>
	</div>
</div>

<!--thresdata electron 값과 연결시키기. 어케해야하는지는 모르겠지만 그렇게 해야 데이터 임계치 값을 받아옴-->
<style>
	/*Common*/
	.Common_div {
		@apply absolute box-border rounded-sm left-[35px] w-[991px] bg-[#2D2938];
	}

	.Common_footer-div {
		@apply absolute box-border rounded-sm w-[480px] bg-[#2D2938];
	}

	.Common_setup {
		@apply absolute pl-[29px];
	}

	/*logo*/
	.Main_logo {
		@apply absolute w-[176px] h-[36px] left-[35px] top-[22px];
	}

	/*Head*/
	.Head-div {
		@apply top-[82px] h-[58px];
	}

	.Head-logo {
		@apply absolute pl-[459px] pt-[22px];
	}

	.Head-button {
		@apply pl-[489px] pt-[16px] text-lg  whitespace-nowrap text-white;
	}

	/*Acquisition*/
	.Acquisition-div {
		@apply top-[162px] h-[135px];
	}

	.Acquisition-setup {
		@apply pt-[16px] font-normal whitespace-nowrap text-white;
	}

	.Acquisition-border {
		@apply border-b-1 border-solid border-[#3E3653];
	}

	.Acquision-table-tr1 {
		@apply font-normal whitespace-nowrap text-[14px] text-[#CFD0FF];
	}

	.Acquision-table-tr2 {
		@apply font-normal w-[194px] h-[30px] pl-[8px] text-[14px] text-white bg-[#1C1920];
	}

	/*Channel*/
	.Channel-div {
		@apply top-[319px] h-[182px];
	}

	.Channel-setup {
		@apply pt-[13px] pb-[14px] font-normal whitespace-nowrap text-white;
	}

	.Channel-external-td {
		@apply pl-[29px] text-[#CFD0FF] text-[14px];
	}

	.Channel-internal-td {
		@apply pl-[27px] pr-[29px];
	}

	.Channel-table-tr {
		@apply font-normal w-[120px] h-[30px] pl-[8px] text-[14px] text-white bg-[#1C1920];
	}

	.Channel-table-tr-thres {
		@apply font-normal w-[120px] h-[30px] pl-[8px] text-[14px] text-red-600 bg-[#1C1920];
	}

	/*Storage*/
	.Storage-div {
		@apply top-[560px] h-[157px];
	}

	.Storage-setup {
		@apply pt-[16px] pb-[16px] font-normal whitespace-nowrap text-white;
	}

	.Storage-td {
		@apply font-normal pl-[29px] pb-[17px] text-[#CFD0FF] text-[14px];
	}

	.Storage-route {
		@apply font-normal w-[720px] h-[30px] pl-[8px] bg-[#1C1920] text-[14px] text-white;
	}
	
	.Storage-button{
		@apply font-normal w-[30px] h-[30px] pl-[4px] text-[14px] bg-[#D9D9D9];
	}

	.Check-button {
		@apply h-[14px] w-[14px] accent-[#D9D9D9];
	}

	/*Time and Error Message*/
	.Footer-div-Time {
		@apply left-[35px] bg-[#2D2938] top-[780px] h-[55px];
	}

	.Footer-div-Error {
		@apply left-[546px] bg-[#2D2938] top-[780px] h-[55px];
	}

</style>
