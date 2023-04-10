<script lang="ts">
	import { page } from '$app/stores';
	// import logo from './svelte-logo.svg';
</script>

<!-- <div class="corner">
		
	<a href="https://kit.svelte.dev">
		<img src={logo} alt="SvelteKit" />
	</a>
</div> -->

<nav class="left-menu ">
	<ul class="menu-item">
		<li class:active={$page.url.pathname === '/'}>
			<a href="/">Chart</a>
		</li>
		<li class:active={$page.url.pathname === '/dataAcquisition'}>
			<a href="/dataAcquisition">Data Acquisition</a>
		</li>
		<li class:active={$page.url.pathname === '/help'}>
			<a href="/help">Help</a>
		</li>
	</ul>
</nav>

<style>
	/* .corner{
		position:fixed;
		top: 0;
		right: 0;
		width: 10px;
		height: 10px;
	} */

	.left-menu {
		position: fixed;
		top: 0;
		left: 0;
		height: 100vh;
		width: 200px;
		background-color: #302b3f;
		font-size: 1rem;
		font-family: sans-serif;
	}

	.menu-item {
		list-style-type: none;
		padding: 0;
		margin: 0;
		text-align: center;
	}

	.menu-item li {
		position: relative;
		height: 100%;
		padding: 10px;
		cursor: pointer;
		border-bottom: 2px solid darkgray;
	}

	.menu-item li.active::before {
		content: '';
		display: inline-block;
		width: 0;
		height: 0;
		border-style: solid;
		border-width: 20px 10px 20px 0px;
		border-color: black black black transparent;
		margin-right: 10px;
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
	}

	.menu-item li a {
		color: #CFD0FF;
		text-decoration: none;
	}

	.menu-item li:hover {
		background-color: #ddd;
	}
</style>
