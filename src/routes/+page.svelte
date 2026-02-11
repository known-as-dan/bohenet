<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { createInspectionStore } from '$lib/stores/inspection.svelte.js';
	import type { SavedReport } from '$lib/stores/reports.js';
	import { haptic } from '$lib/utils/haptics.js';
	import Dashboard from '$lib/components/Dashboard.svelte';
	import StepMeta from '$lib/components/StepMeta.svelte';
	import StepConfig from '$lib/components/StepConfig.svelte';
	import StepChecklist from '$lib/components/StepChecklist.svelte';
	import StepDc from '$lib/components/StepDc.svelte';
	import StepAc from '$lib/components/StepAc.svelte';
	import StepDefects from '$lib/components/StepDefects.svelte';
	import StepSummary from '$lib/components/StepSummary.svelte';

	let store = $state<ReturnType<typeof createInspectionStore> | null>(null);

	const stepIcons = ['📝', '⚙️', '✅', '⚡', '🔌', '⚠️', '📊'];

	function openReport(report: SavedReport) {
		store = createInspectionStore(report);
	}

	function backToDashboard() {
		haptic('light');
		store = null;
	}

	function handleNext() {
		haptic('light');
		store!.nextStep();
	}

	function handlePrev() {
		haptic('light');
		store!.prevStep();
	}

	function handleGoToStep(i: number) {
		if (i === store!.currentStep) return;
		haptic('selection');
		store!.goToStep(i);
	}
</script>

<div class="grid min-h-screen" style="grid-template: 1fr / 1fr;">
{#if !store}
	<div class="col-start-1 row-start-1" in:fade={{ duration: 280, delay: 150 }} out:fade={{ duration: 200 }}>
		<Dashboard onopen={openReport} />
	</div>
{:else}
	<div class="col-start-1 row-start-1 mx-auto w-full max-w-lg px-4 py-4" in:fly={{ y: 30, duration: 350, delay: 150, easing: cubicOut }} out:fade={{ duration: 200 }}>
		<!-- Header with prev/next -->
		<header class="relative mb-4 flex items-center">
			<button
				type="button"
				class="absolute start-0 rounded-xl p-2 text-gray-400 transition-colors hover:bg-surface-700 hover:text-white active:bg-surface-700 active:text-white"
				title="חזרה לרשימת דוחות"
				onclick={backToDashboard}
			>
				→
			</button>
			<div class="min-w-0 flex-1 text-center">
				<h1 class="truncate text-lg font-bold text-white">
					{store.report.name}
				</h1>
				<p class="text-xs text-gray-500">
					{store.inspection.meta.siteName || 'בדיקה חדשה'}
				</p>
			</div>
		</header>

		<!-- Step content -->
		<main class="mb-24 min-h-[60vh]">
			{#key store.currentStep}
				<div in:fade={{ duration: 250 }}>
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
						<StepSummary {store} ondashboard={backToDashboard} />
					{/if}
				</div>
			{/key}
		</main>

		<!-- Step navigation (bottom bar) -->
		<nav class="fixed inset-x-0 bottom-0 flex justify-center px-3 pb-3 pt-8 bg-gradient-to-t from-surface-900 from-40% to-transparent">
			<div class="overflow-x-auto rounded-2xl border border-border-light/50 bg-surface-800/90 px-3 py-2.5 shadow-lg shadow-black/30 backdrop-blur-md md:max-w-fit">
				<div class="flex gap-2">
					{#each store.steps as step, i}
						<button
							type="button"
							class="flex flex-shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all {i === store.currentStep
								? 'bg-accent text-white shadow-md shadow-accent/20'
								: 'bg-surface-700 text-gray-400 hover:bg-surface-600 hover:text-gray-200 active:bg-surface-600 active:text-gray-200'}"
							onclick={() => handleGoToStep(i)}
						>
							<span class="text-base">{stepIcons[i]}</span>
							<span>{step}</span>
						</button>
					{/each}
				</div>
			</div>
		</nav>
	</div>
{/if}
</div>
