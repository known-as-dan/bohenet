<script lang="ts">
	import { createInspectionStore } from '$lib/stores/inspection.svelte.js';
	import StepMeta from '$lib/components/StepMeta.svelte';
	import StepConfig from '$lib/components/StepConfig.svelte';
	import StepChecklist from '$lib/components/StepChecklist.svelte';
	import StepDc from '$lib/components/StepDc.svelte';
	import StepAc from '$lib/components/StepAc.svelte';
	import StepDefects from '$lib/components/StepDefects.svelte';
	import StepSummary from '$lib/components/StepSummary.svelte';

	const store = createInspectionStore();
</script>

<div class="mx-auto max-w-2xl px-4 py-4">
	<!-- Header -->
	<header class="mb-4 text-center">
		<h1 class="text-2xl font-bold text-gray-800">בדיקה תקופתית PV</h1>
	</header>

	<!-- Step navigation -->
	<nav class="mb-6 overflow-x-auto">
		<div class="flex gap-1">
			{#each store.steps as step, i}
				<button
					type="button"
					class="flex-shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors {i === store.currentStep ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
					onclick={() => store.goToStep(i)}
				>
					{step}
				</button>
			{/each}
		</div>
	</nav>

	<!-- Step content -->
	<main class="mb-6">
		{#if store.currentStep === 0}
			<StepMeta {store} />
		{:else if store.currentStep === 1}
			<StepConfig {store} />
		{:else if store.currentStep === 2}
			<StepChecklist {store} />
		{:else if store.currentStep === 3}
			<StepDc {store} />
		{:else if store.currentStep === 4}
			<StepAc {store} />
		{:else if store.currentStep === 5}
			<StepDefects {store} />
		{:else if store.currentStep === 6}
			<StepSummary {store} />
		{/if}
	</main>

	<!-- Navigation buttons -->
	<footer class="sticky bottom-0 flex justify-between border-t border-gray-200 bg-white py-3">
		<button
			type="button"
			class="rounded-lg bg-gray-200 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-40"
			disabled={store.currentStep === 0}
			onclick={() => store.prevStep()}
		>
			הקודם
		</button>
		<span class="self-center text-sm text-gray-400">
			{store.currentStep + 1} / {store.steps.length}
		</span>
		<button
			type="button"
			class="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
			disabled={store.currentStep === store.steps.length - 1}
			onclick={() => store.nextStep()}
		>
			הבא
		</button>
	</footer>
</div>
