<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import "../app.css";
</script>

<!--상단의 메뉴바-->
<header>
	<Header />
</header>

<!--SCiChart 그래프 보여주는 main-->
<main class="bg-[#1C1920]">
	<slot />
</main>

<!--하단-->
<footer>
	<!-- <p>visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to learn SvelteKit</p> -->
</footer>


<style>
	header {
		display: flex;
		flex-direction: row;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1;
		
	}


	main {
		position: fixed;
		top: 0;
		left: 200px;
		display: block;
		padding: 1rem;
		height: 100%;
		width: 100%;
		margin: 0 auto;
		box-sizing: border-box;
		overflow-x: hidden;
	}

</style>
