<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import FullScreenChart from '../lib/components/FullScreenChart.svelte';

	type Coordinate = [{ x: number; y: number }];

	let signal: Coordinate;
	let phase = 0;
	let signalLength = 10;
	let frequency = 1;
	let isRunning = false;

	let genData: any;
	try {
		genData = globalThis['ipc' as keyof typeof globalThis]['dataGenerator'];
	} catch (error) {
		console.error(error);
		genData = null;
	}
	let intervalId: string | number | NodeJS.Timer | undefined;
	let intervalFn: { (): void; (): void };

	$: {
		if (isRunning) {
			intervalId = setInterval(intervalFn, 10);
		} else {
			clearInterval(intervalId);
		}
	}

	async function handlePlotButtonClick() {
		isRunning = !isRunning;
	}

	onMount(async () => {
		genData.receive('getSignal', (data: Coordinate) => {
			if (isRunning) signal = data;
		});
		intervalFn = () => {
			phase = phase + 0.01;
			try {
				genData.send('genSignal', { signalLength, frequency, phase });
			} catch (e) {
				console.error(e);
			}
		};
	});
	onDestroy(async () => {
		clearInterval(intervalId);
	});
</script>

<div>
	<label>
		Signal Length:
		<input type="number" bind:value={signalLength} />
	</label>
	<label>
		Signal Frequency:
		<input type="number" bind:value={frequency} />
	</label>
	<button on:click={handlePlotButtonClick}>
		{isRunning ? 'Stop' : 'Start'}
	</button>
	<FullScreenChart
		data={signal
			? signal
			: [	
				{ x: 0, y: 0 },
				{ x: 1, y: 1 }]
			}
	/>
</div>

