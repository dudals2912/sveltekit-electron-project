<script lang="ts">
	import { FastLineRenderableSeries } from 'scichart/Charting/Visuals/RenderableSeries/FastLineRenderableSeries';
	import { NumericAxis } from 'scichart/Charting/Visuals/Axis/NumericAxis';
	import { SciChartSurface } from 'scichart/Charting/Visuals/SciChartSurface';
	import { XyDataSeries } from 'scichart/Charting/Model/XyDataSeries';
	import { onMount } from 'svelte';
	import { LegendModifier } from 'scichart';

	export let y_data: number[][];
	export let x_data: number[];
	let prev_y;

	$: {
		if (prev_y?.length != y_data[0].length) {
			xyDataSeriesList?.map((xyDataSeries, channel) => {
				xyDataSeries.clear();
				for (let i = 0; i < x_data.length; i++) xyDataSeries?.append(x_data[i], y_data[channel][i]);
			});
		} else {
			xyDataSeriesList?.map((xyDataSeries, channel) => {
				for (let i = 0; i < x_data.length; i++) xyDataSeries?.update(i, y_data[channel][i]);
			});
		}
		sciChartSurface?.zoomExtents();
		prev_y = y_data[0];
	}
	let sciChartSurface: SciChartSurface, wasmContext: any, xyDataSeriesList: XyDataSeries[];

	async function initSciChart(chartId: string | HTMLDivElement, x: number[], y: number[][]) {
		// Create the SciChartSurface in the div with the given id
		// The SciChartSurface, and webassembly context 'wasmContext' are paired. This wasmContext
		// instance must be passed to other types that exist on the same surface.
		const result = await SciChartSurface.create(chartId);

		sciChartSurface = result.sciChartSurface;
		wasmContext = result.wasmContext;
		// Create an X,Y Axis and add to the chart
		const xAxis = new NumericAxis(wasmContext);
		const yAxis = new NumericAxis(wasmContext);

		sciChartSurface.xAxes.add(xAxis);
		sciChartSurface.yAxes.add(yAxis);
		const colors = ['rgba(255,0,0,1)', 'rgba(0,255,0,1)', 'rgba(0,0,255,1)', 'rgba(255,165,0,1)'];
		// Declare a DataSeries
		xyDataSeriesList = [];
		y.map((y_item, channel) => {
			xyDataSeriesList.push(
				new XyDataSeries(wasmContext, { dataSeriesName: `Channel ${channel + 1}` })
			);
			const xyDataSeries = xyDataSeriesList[channel];
			x.map((x_item, index) => xyDataSeries.append(x_item, y_item[index]));
			xyDataSeries.isSorted = true;
			xyDataSeries.containsNaN = false;
			// Add a line series to the SciChartSurface
			const lineSeries = new FastLineRenderableSeries(wasmContext);
			lineSeries.strokeThickness = 2;
			lineSeries.stroke = colors[channel];
			lineSeries.dataSeries = xyDataSeries;

			sciChartSurface.renderableSeries.add(lineSeries);
		});

		sciChartSurface.chartModifiers.add(
			new LegendModifier({
				showCheckboxes: true,
				showSeriesMarkers: true,
				showLegend: true
			})
		);
		// zoom to fit
		sciChartSurface.zoomExtents();
	}
	onMount(async () => {
		SciChartSurface.setRuntimeLicenseKey(
			'iGdvb+TdnA12RmrAv//xhBaQnq5Kjgi55gv/seHE8RzR9IfugCXagtn1GXKSX8/VfWTGQpsxaODkY9oZKkq2ensfATqVIoqz7kLL3nfKE0WK5u7UtcN+h11Vya6JgVrHYgOtLoF33gMJ9ydYST/Zqqpe9jS3bZEz+pjictFVuPnbVMWKrtey62sCZ3R8hocBqK4R7FsI+cs5tWXnG3WXtY4XYg2QS0+IMN6IIPwwt7KuVXqQc6c8qdXpssnCNZZXDYtTDZWg5prXWBWdV899PP97KNEE3f62zMDNzqXKTlH8blOyqz2/wcKObLiWeqQUg9t8fGlA2T/T2uqUjsR8xkbBtlB4YBwuseWwCN06YW6UGXUaKi6CD8iTXdbIWRDbuI31U9s7gOYw2fW3duJaOgWzF4dR4ehEdS8Z00Z32rNBJOcXEyDbMynbzX5FQ4ElYoSI9KxmkdRRcwj1G/XhHW1NBRK9mv+93W3gM2mygh2zHa+O6mmEjtUWLRldj5PnqT5/91EsJhWf0wvFE8uu1zwn1aGSFkRw+P6tnSsuQUIoh/B4Sk7dqxStrRQ='
		);
		initSciChart('root-chart', x_data, y_data);
	});
</script>

<div id="root-chart" style=" height: '100%', width: '100%' "  />

