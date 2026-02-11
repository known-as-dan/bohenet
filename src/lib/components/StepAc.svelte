<script lang="ts">
	import { slide } from 'svelte/transition';
	import { haptic } from '$lib/utils/haptics.js';
	import { acSections } from '$lib/config/ac.js';
	import type { createInspectionStore } from '$lib/stores/inspection.svelte.js';

	let { store }: { store: ReturnType<typeof createInspectionStore> } = $props();

	let expandedSections = $state<Record<number, boolean>>({});

	$effect(() => {
		acSections.forEach((_, i) => {
			if (!(i in expandedSections)) expandedSections[i] = true;
		});
	});

	let showSerials = $state(true);

	function toggleSection(idx: number) {
		haptic('light');
		expandedSections[idx] = !expandedSections[idx];
	}
</script>

<div class="space-y-4">
	<div>
		<h2 class="text-lg font-bold text-white">מדידות AC</h2>
		<p class="text-sm text-gray-400">ערכי מתח, זרם ובדיקות AC</p>
	</div>

	{#each acSections as section, sIdx (section.code)}
		<div class="overflow-hidden rounded-xl border border-border bg-surface-800">
			<button
				type="button"
				class="flex w-full items-center justify-between p-3 text-start transition-colors hover:bg-surface-700 active:bg-surface-700"
				onclick={() => toggleSection(sIdx)}
			>
				<span class="font-semibold text-white">{section.title}</span>
				<svg class="h-5 w-5 text-gray-400 transition-transform duration-200 {expandedSections[sIdx] ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
			</button>

			{#if expandedSections[sIdx]}
				<div class="space-y-2 border-t border-border p-3" transition:slide={{ duration: 300 }}>
					{#each section.items as item (item.itemCode)}
						{@const measurement = store.inspection.acMeasurements.find(
							(m) => m.itemCode === item.itemCode
						)}
						{#if measurement}
							<div class="flex items-center gap-2 rounded-lg bg-surface-700/50 p-2">
								<span class="min-w-0 flex-1 text-sm text-gray-300"
									>{item.description}</span
								>
								<input
									type="text"
									placeholder="תוצאה"
								class="w-24 border-none bg-surface-700 px-2.5 py-1.5 text-center text-sm"
									value={measurement.result ?? ''}
									oninput={(e) =>
										store.updateAcMeasurement(
											item.itemCode,
											e.currentTarget.value || undefined
										)}
								/>
								<input
									type="text"
									placeholder="הערות"
								class="w-28 border-none bg-surface-700 px-2.5 py-1.5 text-center text-sm"
									value={measurement.notes ?? ''}
									oninput={(e) =>
										store.updateAcMeasurement(
											item.itemCode,
											undefined,
											e.currentTarget.value || undefined
										)}
								/>
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		</div>
	{/each}

	<!-- Inverter serial numbers -->
	<div class="overflow-hidden rounded-xl border border-border bg-surface-800">
		<button
			type="button"
			class="flex w-full items-center justify-between p-3 text-start transition-colors hover:bg-surface-700"
			onclick={() => { haptic('light'); showSerials = !showSerials; }}
		>
			<div class="flex items-center gap-2">
				<span class="text-lg">🔢</span>
				<span class="font-semibold text-white">מספרים סידוריים של ממירים</span>
			</div>
			<svg class="h-5 w-5 text-gray-400 transition-transform duration-200 {showSerials ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
		</button>

		{#if showSerials}
			<div class="space-y-2 border-t border-border p-3" transition:slide={{ duration: 300 }}>
				{#each store.inspection.inverterSerials as serial (serial.inverterIndex)}
					<div class="flex items-center gap-2 rounded-lg bg-surface-700/50 p-2">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-dim text-sm font-bold text-accent"
						>
							{serial.inverterIndex}
						</div>
						<span class="text-sm text-gray-300">ממיר {serial.inverterIndex}</span>
						<input
							type="text"
							placeholder="מספר סידורי"
							class="min-w-0 flex-1 border-none bg-surface-700 px-2.5 py-1.5 text-sm"
							value={serial.serialNumber ?? ''}
							oninput={(e) =>
								store.updateInverterSerial(
									serial.inverterIndex,
									e.currentTarget.value
								)}
						/>
					</div>
				{/each}

				{#if store.inspection.inverterSerials.length === 0}
					<p class="py-4 text-center text-sm text-gray-500">
						יש להגדיר ממירים בשלב הגדרת מערכת
					</p>
				{/if}
			</div>
		{/if}
	</div>
</div>