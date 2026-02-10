<script lang="ts">
	import type { createInspectionStore } from '$lib/stores/inspection.svelte.js';
	import { acSections } from '$lib/config/ac.js';

	let { store }: { store: ReturnType<typeof createInspectionStore> } = $props();

	let expandedSections = $state<Record<string, boolean>>(
		Object.fromEntries(acSections.map((s) => [s.code, true]))
	);

	function toggleSection(code: string) {
		expandedSections[code] = !expandedSections[code];
	}
</script>

<div class="space-y-6">
	<h2 class="text-xl font-bold">מדידות AC</h2>

	{#each acSections as section (section.code)}
		<div class="overflow-hidden rounded-lg border border-gray-200">
			<button
				type="button"
				class="flex w-full items-center justify-between bg-gray-50 p-3 text-start"
				onclick={() => toggleSection(section.code)}
			>
				<span class="font-semibold"
					>{expandedSections[section.code] ? '▾' : '▸'} {section.code}. {section.title}</span
				>
			</button>

			{#if expandedSections[section.code]}
				<div class="divide-y divide-gray-100">
					{#each section.items as item (item.itemCode)}
						{@const measurement = store.inspection.acMeasurements.find(
							(a) => a.itemCode === item.itemCode
						)}
						<div class="flex flex-wrap items-center gap-3 p-3">
							<span class="w-10 text-sm text-gray-500">{item.itemCode}</span>
							<span class="min-w-24 flex-1 text-sm">{item.description}</span>
							<input
								type="text"
								class="w-28 rounded border-gray-300 text-sm shadow-sm"
								placeholder="תוצאה"
								value={measurement?.result ?? ''}
								oninput={(e) => {
									const v = e.currentTarget.value;
									const num = parseFloat(v);
									store.updateAcMeasurement(
										item.itemCode,
										isNaN(num) ? v : num,
										undefined
									);
								}}
							/>
							<input
								type="text"
								class="w-36 rounded border-gray-300 text-sm shadow-sm"
								placeholder="הערות"
								value={measurement?.notes ?? ''}
								oninput={(e) =>
									store.updateAcMeasurement(
										item.itemCode,
										undefined,
										e.currentTarget.value
									)}
							/>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/each}

	<!-- Inverter Serials -->
	{#if store.inspection.inverterSerials.length > 0}
		<div class="overflow-hidden rounded-lg border border-gray-200">
			<div class="bg-gray-50 p-3">
				<span class="font-semibold">6. מספרים סידוריים - מהפכים</span>
			</div>
			<div class="divide-y divide-gray-100">
				{#each store.inspection.inverterSerials as serial (serial.inverterIndex)}
					<div class="flex items-center gap-3 p-3">
						<span class="text-sm text-gray-500">6.{serial.inverterIndex}</span>
						<span class="min-w-20 text-sm">מהפך {serial.inverterIndex}</span>
						<input
							type="text"
							class="flex-1 rounded border-gray-300 text-sm shadow-sm"
							placeholder="S/N"
							value={serial.serialNumber}
							oninput={(e) =>
								store.updateInverterSerial(serial.inverterIndex, e.currentTarget.value)}
						/>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
