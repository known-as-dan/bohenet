<script lang="ts">
	import { slide } from 'svelte/transition';
	import { haptic } from '$lib/utils/haptics.js';
	import type { createInspectionStore } from '$lib/stores/inspection.svelte.js';

	let { store }: { store: ReturnType<typeof createInspectionStore> } = $props();

	let expandedInverters = $state<Record<number, boolean>>({});

	$effect(() => {
		for (const c of store.inspection.inverterConfigs) {
			if (!(c.index in expandedInverters)) {
				expandedInverters[c.index] = true;
			}
		}
	});

	function toggleInverter(index: number) {
		haptic('light');
		expandedInverters[index] = !expandedInverters[index];
	}

	function parseNum(val: string): number | undefined {
		const n = parseFloat(val);
		return isNaN(n) ? undefined : n;
	}
</script>

<div class="space-y-4">
	<div>
		<h2 class="text-lg font-bold text-white">מדידות DC</h2>
		<p class="text-sm text-gray-400">מתח, זרם ובידוד לכל מחרוזת</p>
	</div>

	{#each store.inspection.inverterConfigs as config (config.index)}
		<div class="overflow-hidden rounded-xl border border-border bg-surface-800">
			<button
				type="button"
				class="flex w-full items-center justify-between p-3 text-start transition-colors active:bg-surface-700"
				onclick={() => toggleInverter(config.index)}
			>
				<div class="flex items-center gap-2.5">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-dim text-sm font-bold text-accent"
					>
						{config.index}
					</div>
					<span class="font-semibold text-white">{config.label}</span>
				</div>
				<div class="flex items-center gap-1 text-sm text-gray-500">
					<span>{config.stringCount} מחרוזות</span>
					<svg class="h-5 w-5 text-gray-400 transition-transform duration-200 {expandedInverters[config.index] ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
				</div>
			</button>

			{#if expandedInverters[config.index]}
				<div class="overflow-x-auto border-t border-border" transition:slide={{ duration: 300 }}>
					<table class="min-w-full text-sm">
						<thead>
							<tr class="bg-surface-700 text-[10px] leading-tight text-gray-400">
								<th class="px-2 py-2 text-start font-medium">מחרוזת</th>
								<th class="px-2 py-2 text-start font-medium">מס׳<br/>קולטים</th>
								<th class="px-2 py-2 text-start font-medium">מתח הולכה<br/><span class="text-gray-500">(V)</span></th>
								<th class="px-2 py-2 text-start font-medium">זרם עבודה<br/><span class="text-gray-500">(A)</span></th>
								<th class="px-2 py-2 text-start font-medium">בידוד<br/>סטרינג<br/><span class="text-gray-500">(MΩ)</span></th>
								<th class="px-2 py-2 text-start font-medium">בידוד<br/>הזנה −<br/><span class="text-gray-500">(MΩ)</span></th>
								<th class="px-2 py-2 text-start font-medium">בידוד<br/>הזנה +<br/><span class="text-gray-500">(MΩ)</span></th>
							</tr>
						</thead>
						<tbody>
							{#each store.inspection.dcMeasurements.filter((m) => m.inverterIndex === config.index) as measurement, idx (measurement.stringLabel)}
								<tr
									class="{idx % 2 === 0
										? 'bg-surface-800'
										: 'bg-surface-800/50'} border-t border-border/30"
								>
									<td class="px-2 py-1.5">
										<span
											class="inline-flex h-6 w-6 items-center justify-center rounded bg-surface-600 text-xs font-bold text-gray-300"
											>{measurement.stringLabel}</span
										>
									</td>
									<td class="px-1 py-1.5">
										<input
											type="number"
											class="w-14 border-none bg-surface-700 px-1.5 py-1 text-center text-sm"
											value={measurement.panelCount ?? ''}
											oninput={(e) =>
												store.updateDcMeasurement(
													config.index,
													measurement.stringLabel,
													{ panelCount: parseNum(e.currentTarget.value) }
												)}
										/>
									</td>
									<td class="px-1 py-1.5">
										<input
											type="number"
											step="0.1"
											class="w-18 border-none bg-surface-700 px-1.5 py-1 text-center text-sm"
											value={measurement.openCircuitVoltage ?? ''}
											oninput={(e) =>
												store.updateDcMeasurement(
													config.index,
													measurement.stringLabel,
													{
														openCircuitVoltage: parseNum(
															e.currentTarget.value
														)
													}
												)}
										/>
									</td>
									<td class="px-1 py-1.5">
										<input
											type="number"
											step="0.01"
											class="w-18 border-none bg-surface-700 px-1.5 py-1 text-center text-sm"
											value={measurement.operatingCurrent ?? ''}
											oninput={(e) =>
												store.updateDcMeasurement(
													config.index,
													measurement.stringLabel,
													{
														operatingCurrent: parseNum(
															e.currentTarget.value
														)
													}
												)}
										/>
									</td>
									<td class="px-1 py-1.5">
										<input
											type="number"
											step="0.1"
											class="w-18 border-none bg-surface-700 px-1.5 py-1 text-center text-sm"
											value={measurement.stringRiso ?? ''}
											oninput={(e) =>
												store.updateDcMeasurement(
													config.index,
													measurement.stringLabel,
													{
														stringRiso: parseNum(e.currentTarget.value)
													}
												)}
										/>
									</td>
									<td class="px-1 py-1.5">
										<input
											type="number"
											step="0.1"
											class="w-18 border-none bg-surface-700 px-1.5 py-1 text-center text-sm"
											value={measurement.feedRisoNegative ?? ''}
											oninput={(e) =>
												store.updateDcMeasurement(
													config.index,
													measurement.stringLabel,
													{
														feedRisoNegative: parseNum(
															e.currentTarget.value
														)
													}
												)}
										/>
									</td>
									<td class="px-1 py-1.5">
										<input
											type="number"
											step="0.1"
											class="w-18 border-none bg-surface-700 px-1.5 py-1 text-center text-sm"
											value={measurement.feedRisoPositive ?? ''}
											oninput={(e) =>
												store.updateDcMeasurement(
													config.index,
													measurement.stringLabel,
													{
														feedRisoPositive: parseNum(
															e.currentTarget.value
														)
													}
												)}
										/>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/each}

	{#if store.inspection.inverterConfigs.length === 0}
		<div class="py-12 text-center">
			<div class="mb-2 text-4xl opacity-30">⚡</div>
			<p class="text-gray-400">יש להגדיר ממירים בשלב הגדרת מערכת</p>
		</div>
	{/if}
</div>