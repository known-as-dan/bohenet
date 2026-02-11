<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import { createInspectionStore } from '$lib/stores/inspection.svelte.js';
	import { loadReport } from '$lib/stores/reports.js';
	import { STEP_SLUGS, STEP_LABELS, STEP_ICONS, slugToIndex, indexToSlug, type StepSlug } from '$lib/config/steps.js';
	import { haptic } from '$lib/utils/haptics.js';
	import StepMeta from '$lib/components/StepMeta.svelte';
	import StepConfig from '$lib/components/StepConfig.svelte';
	import StepChecklist from '$lib/components/StepChecklist.svelte';
	import StepDc from '$lib/components/StepDc.svelte';
	import StepAc from '$lib/components/StepAc.svelte';
	import StepDefects from '$lib/components/StepDefects.svelte';
	import StepSummary from '$lib/components/StepSummary.svelte';

	const reportId = page.params.id!;
	const report = loadReport(reportId);

	if (!report) {
		goto('/', { replaceState: true });
	}

	const store = report ? createInspectionStore(report) : undefined;

	let currentSlug: StepSlug = $derived(
		STEP_SLUGS.includes(page.url.searchParams.get('step') as StepSlug)
			? (page.url.searchParams.get('step') as StepSlug)
			: 'meta'
	);
	let currentStepIndex = $derived(slugToIndex(currentSlug));

	function goToStep(slug: StepSlug) {
		haptic('selection');
		goto(`/report/${reportId}?step=${slug}`, { replaceState: true, noScroll: true });
	}

	function handleNext() {
		haptic('light');
		const nextIdx = Math.min(currentStepIndex + 1, STEP_SLUGS.length - 1);
		goToStep(indexToSlug(nextIdx));
	}

	function handlePrev() {
		haptic('light');
		const prevIdx = Math.max(currentStepIndex - 1, 0);
		goToStep(indexToSlug(prevIdx));
	}

	function backToDashboard() {
		haptic('light');
		goto('/');
	}
</script>

{#if store}
	<div class="mx-auto w-full max-w-lg px-4 py-4">
		<!-- Header with back button -->
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
			{#key currentSlug}
				<div in:fade={{ duration: 250 }}>
					{#if currentStepIndex === 0}
						<StepMeta {store} />
					{:else if currentStepIndex === 1}
						<StepConfig {store} />
					{:else if currentStepIndex === 2}
						<StepChecklist {store} />
					{:else if currentStepIndex === 3}
						<StepDc {store} />
					{:else if currentStepIndex === 4}
						<StepAc {store} />
					{:else if currentStepIndex === 5}
						<StepDefects {store} />
					{:else if currentStepIndex === 6}
						<StepSummary {store} ondashboard={backToDashboard} />
					{/if}
				</div>
			{/key}
		</main>

		<!-- Step navigation (bottom bar) -->
		<nav class="fixed inset-x-0 bottom-0 flex justify-center px-3 pb-3 pt-8 bg-gradient-to-t from-surface-900 from-40% to-transparent">
			<div class="overflow-x-auto rounded-2xl border border-border-light/50 bg-surface-800/90 px-3 py-2.5 shadow-lg shadow-black/30 backdrop-blur-md md:max-w-fit">
				<div class="flex gap-2">
					{#each STEP_SLUGS as slug (slug)}
						<button
							type="button"
							class="flex flex-shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all {slug === currentSlug
								? 'bg-accent text-white shadow-md shadow-accent/20'
								: 'bg-surface-700 text-gray-400 hover:bg-surface-600 hover:text-gray-200 active:bg-surface-600 active:text-gray-200'}"
							onclick={() => goToStep(slug)}
						>
							<span class="text-base">{STEP_ICONS[slug]}</span>
							<span>{STEP_LABELS[slug]}</span>
						</button>
					{/each}
				</div>
			</div>
		</nav>
	</div>
{/if}
