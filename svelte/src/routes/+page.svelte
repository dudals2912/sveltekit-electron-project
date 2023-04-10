<!--javascript(svelte), ts-> typescript -->
<script lang="ts">
	import { get } from 'lodash';
	import { SciChart3DRenderer } from 'scichart';
	import { onDestroy, onMount } from 'svelte';
	import FullScreenChart from '../lib/components/FullScreenChart.svelte';

	//signalLength -> 받아오는 주기를 결정짓는 변수
	//samplingRate -> 1초당 받아오는 데이터 수
	//channels -> number of channels
	//sensorType -> sensorType(ACC or AE)
	let y_series: number[][];
	let x_series: number[];
	let signalLength = 1;
	let samplingRate = 25600;
	let isRunning = false;
	let nSamples: number;
	let get_data: number[] = [];
	let check: boolean = false;
	4;
	const channels = [0, 1, 2, 3];
	const sensorType = 0;

	// $: -> 센서 감지와 같은 역할,
	// 1. 트리거(=,+=...)가 실행, 2. 데이터 반응({count}), 3. 센서 감지($:), 4. 동작(console.log)의 순으로 실행됨
	$: {
		nSamples = signalLength * samplingRate;
	}

	//electron에서 데이터를 받아오기 위한 변수
	let daq: any;

	$: {
		if (isRunning) {
			//electron으로 사용할 변수의 값을 send
			daq?.send('init', { inSamplingRate: samplingRate, inNSamples: nSamples });
			daq?.send('startTask', {});
		} else {
			daq?.send('stopTask', {});
			// daq?.send('createTask', { sensorType, inChannels: channels });
		}
	}

	//버튼 클릭 이벤트
	async function handlePlotButtonClick() {
		isRunning = !isRunning;
	}

	//onMount -> 컴포넌트 html 렌더링 된 이후에 실행, 컴포넌트가 화면에 출력된 이후 사용하는 훅 (콜백)
	onMount(async () => {
		try {
			daq = globalThis['ipc' as keyof typeof globalThis]['daq'];
		} catch (error) {
			console.error(error);
			daq = null;
		}
		//electron으로 사용할 변수의 값을 send
		daq?.send('createTask', { sensorType, inChannels: channels });
		//electron에서 채널(매개변수)의 값을 receive해 그래프로 찍어냄
		daq?.receive('getSignal', (x: number[], y: number[][]) => {
			if (isRunning) {
				y_series = y;
				x_series = x;
				// isRunning = false;
			}
		});
		daq?.receive('getData', (data: number[]) => {
			get_data = data;
		});
	});

	//onDestroy -> 컴포넌트 연결해지되기 직전에 실행
	onDestroy(async () => {
		daq?.send('stopTask', {});
		daq?.send('destroyTask', {});
	});


	

</script>

<svelte:head>
	<title>Chart</title>
	<meta name="Chart" content="Show realtime Chart" />
</svelte:head>

<!--HTML(mark up area)-->`
<div>
	<label>
		Signal Length:
		<input type="number" bind:value={signalLength} />
	</label>
	<label>
		Sampling Rate:
		<input type="number" bind:value={samplingRate} />
	</label>
	<button on:click={handlePlotButtonClick}>
		{isRunning ? 'Stop' : 'Start'}
	</button>
	<div id="signal_plot" class="container">
		<FullScreenChart
			x_data={x_series ? x_series : [0]}
			y_data={y_series ? y_series : [[0], [0], [0], [0]]}
		/>
	</div>
	<!-- {get_data} -->
</div>

<!--CSS-->
<style>
	/* channel css */
	:global(#signal_plot input) {
		width: 30px;
		height: 30px;
	}
</style>
