<script lang="ts">
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
		expandedInverters[index] = !expandedInverters[index];
	}

	function parseNum(val: string): number | undefined {
		const n = parseFloat(val);
		return isNaN(n) ? undefined : n;
	}
</script>

<div class="space-y-4">
	<h2 class="text-xl font-bold">מדידות DC</h2>

	{#each store.inspection.inverterConfigs as config (config.index)}
		<div class="overflow-hidden rounded-lg border border-gray-200">
			<button
				type="button"
				class="flex w-full items-center justify-between bg-gray-50 p-3 text-start"
				onclick={() => toggleInverter(config.index)}
			>
				<span class="font-semibold"
					>{expandedInverters[config.index] ? '▾' : '▸'} {config.label}</span
				>
				<span class="text-sm text-gray-500">{config.stringCount} מחרוזות</span>
			</button>

			{#if expandedInverters[config.index]}
				<div class="overflow-x-auto">
					<table class="min-w-full text-sm">
						<thead class="bg-gray-100">
							<tr>
								<th class="px-2 py-1.5 text-start">מחר׳</th>
								<th class="px-2 py-1.5 text-start">קולטים</th>
								<th class="px-2 py-1.5 text-start">Voc (V)</th>
								<th class="px-2 py-1.5 text-start">Iop (A)</th>
								<th class="px-2 py-1.5 text-start">Riso (MΩ)</th>
								<th class="px-2 py-1.5 text-start">Riso- (MΩ)</th>
								<th class="px-2 py-1.5 text-start">Riso+ (MΩ)</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-100">
							{#each store.inspection.dcMeasurements.filter((m) => m.inverterIndex === config.index) as measurement (measurement.stringLabel)}
								<tr>
									<td class="px-2 py-1 font-medium">{measurement.stringLabel}</td>
									<td class="px-1 py-1">
										<input
											type="number"
											class="w-16 rounded border-gray-300 px-1 py-0.5 text-sm"
											value={measurement.panelCount ?? ''}
											oninput={(e) =>
												store.updateDcMeasurement(
													config.index,
													measurement.stringLabel,
													{ panelCount: parseNum(e.currentTarget.value) }
												)}
										/>
									</td>
									<td class="px-1 py-1">
										<input
											type="number"
											step="0.1"
											class="w-20 rounded border-gray-300 px-1 py-0.5 text-sm"
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
									<td class="px-1 py-1">
										<input
											type="number"
											step="0.01"
											class="w-20 rounded border-gray-300 px-1 py-0.5 text-sm"
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
									<td class="px-1 py-1">
										<input
											type="number"
											step="0.1"
											class="w-20 rounded border-gray-300 px-1 py-0.5 text-sm"
											value={measurement.stringRiso ?? ''}
											oninput={(e) =>
												store.updateDcMeasurement(
													config.index,
													measurement.stringLabel,
													{ stringRiso: parseNum(e.currentTarget.value) }
												)}
										/>
									</td>
									<td class="px-1 py-1">
										<input
											type="number"
											step="0.1"
											class="w-20 rounded border-gray-300 px-1 py-0.5 text-sm"
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
									<td class="px-1 py-1">
										<input
											type="number"
											step="0.1"
											class="w-20 rounded border-gray-300 px-1 py-0.5 text-sm"
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
		<p class="text-center text-gray-500">יש להגדיר ממירים בשלב הגדרת מערכת</p>
	{/if}
</div>
