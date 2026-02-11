<script lang="ts">
	import { slide } from 'svelte/transition';
	import { haptic } from '$lib/utils/haptics.js';
	import type { createInspectionStore } from '$lib/stores/inspection.svelte.js';
	import { getOrderedDcTree } from '$lib/stores/inspection.svelte.js';

	let { store }: { store: ReturnType<typeof createInspectionStore> } = $props();

	let expandedInverters = $state<Record<number, boolean>>({});
	let collapsedNodes = $state<Record<string, boolean>>({});

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

	function toggleNode(id: string) {
		haptic('light');
		collapsedNodes[id] = !collapsedNodes[id];
	}

	function hasChildren(id: string): boolean {
		return store.inspection.dcMeasurements.some((m) => m.parentId === id);
	}

	function isVisible(measurement: { id: string; parentId: string | null }): boolean {
		let current = measurement;
		while (current.parentId) {
			if (collapsedNodes[current.parentId]) return false;
			const parent = store.inspection.dcMeasurements.find((m) => m.id === current.parentId);
			if (!parent) break;
			current = parent;
		}
		return true;
	}

	function parseNum(val: string): number | undefined {
		const n = parseFloat(val);
		return isNaN(n) ? undefined : n;
	}

	function handleAddString(inverterIndex: number) {
		haptic('medium');
		store.addDcString(inverterIndex);
	}

	function handleAddChild(parentId: string) {
		haptic('medium');
		collapsedNodes[parentId] = false;
		store.addDcSubstring(parentId);
	}

	function handleRemove(id: string) {
		haptic('warning');
		store.removeDcMeasurement(id);
	}
</script>

<div class="space-y-4">
	<div>
		<h2 class="text-lg font-bold text-white">מדידות DC</h2>
		<p class="text-sm text-gray-400">מתח, זרם ובידוד לכל מחרוזת</p>
	</div>

	{#each store.inspection.inverterConfigs as config (config.index)}
		<div class="overflow-hidden rounded-xl border border-border bg-surface-800">
			<!-- Inverter header -->
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
					<svg
						class="h-5 w-5 text-gray-400 transition-transform duration-200 {expandedInverters[config.index] ? 'rotate-180' : ''}"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
					</svg>
				</div>
			</button>

			{#if expandedInverters[config.index]}
				<div class="border-t border-border" transition:slide={{ duration: 300 }}>
					<!-- Scrollable table wrapper -->
					<div class="relative overflow-x-auto">
						<table class="w-full text-sm">
							<thead>
								<tr class="bg-surface-700 text-xs text-gray-400">
									<th
										class="sticky start-0 z-10 min-w-[120px] bg-surface-700 px-2 py-2.5 text-start font-medium"
									>
										מחרוזת
									</th>
									<th class="min-w-[72px] px-2 py-2.5 text-start font-medium">
										קולטים
									</th>
									<th class="min-w-[80px] px-2 py-2.5 text-start font-medium">
										מתח<br /><span class="text-gray-500">(V)</span>
									</th>
									<th class="min-w-[80px] px-2 py-2.5 text-start font-medium">
										זרם<br /><span class="text-gray-500">(A)</span>
									</th>
									<th class="min-w-[80px] px-2 py-2.5 text-start font-medium">
										בידוד<br /><span class="text-gray-500">(MΩ)</span>
									</th>
									<th class="min-w-[80px] px-2 py-2.5 text-start font-medium">
										הזנה −<br /><span class="text-gray-500">(MΩ)</span>
									</th>
									<th class="min-w-[80px] px-2 py-2.5 text-start font-medium">
										הזנה +<br /><span class="text-gray-500">(MΩ)</span>
									</th>
								</tr>
							</thead>
							<tbody>
								{#each getOrderedDcTree(store.inspection.dcMeasurements, config.index) as { measurement, depth } (measurement.id)}
									{#if isVisible(measurement)}
										{@const isParent = hasChildren(measurement.id)}
										{@const isCollapsed = !!collapsedNodes[measurement.id]}
										<tr
											class="border-t border-border/30 {depth % 2 === 0
												? 'bg-surface-800'
												: 'bg-surface-800/50'}"
										>
											<!-- Sticky label column with tree controls -->
											<td
												class="sticky start-0 z-10 px-2 py-1.5 {depth % 2 === 0
													? 'bg-surface-800'
													: 'bg-surface-800/50'}"
											>
												<div
													class="flex items-center gap-1"
													style="padding-inline-start: {depth * 20}px"
												>
													<!-- Expand/collapse or tree connector -->
													{#if isParent}
														<button
															type="button"
															class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded text-gray-400 active:bg-surface-600"
															title={isCollapsed ? 'הרחב' : 'כווץ'}
															onclick={() => toggleNode(measurement.id)}
														>
															<svg
																class="h-4 w-4 transition-transform duration-150 {isCollapsed ? '-rotate-90' : ''}"
																fill="none"
																viewBox="0 0 24 24"
																stroke="currentColor"
																stroke-width="2"
															>
																<path
																	stroke-linecap="round"
																	stroke-linejoin="round"
																	d="M19 9l-7 7-7-7"
																/>
															</svg>
														</button>
													{:else if depth > 0}
														<div class="w-7 flex-shrink-0 text-center text-gray-600">└</div>
													{/if}

													<!-- Label badge -->
													<span
														class="inline-flex h-7 min-w-7 items-center justify-center rounded bg-surface-600 px-1.5 text-sm font-bold {depth > 0 ? 'text-gray-400' : 'text-gray-200'}"
													>
														{measurement.stringLabel}
													</span>

													<!-- Add child button -->
													<button
														type="button"
														class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded text-gray-600 transition-colors hover:text-accent active:bg-surface-600"
														title="הוסף תת-מחרוזת"
														onclick={() => handleAddChild(measurement.id)}
													>
														<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
															<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
														</svg>
													</button>

													<!-- Delete button (sub-strings only) -->
													{#if depth > 0}
														<button
															type="button"
															class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded text-gray-600 transition-colors hover:text-danger active:bg-surface-600"
															title="מחק מחרוזת"
															onclick={() => handleRemove(measurement.id)}
														>
															<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
																<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
															</svg>
														</button>
													{/if}
												</div>
											</td>

											<!-- Measurement inputs -->
											<td class="px-1.5 py-1.5">
												<input
													type="number"
													class="w-16 border-none bg-surface-700 px-2 py-2 text-center text-sm"
													value={measurement.panelCount ?? ''}
													oninput={(e) =>
														store.updateDcMeasurement(measurement.id, {
															panelCount: parseNum(e.currentTarget.value)
														})}
												/>
											</td>
											<td class="px-1.5 py-1.5">
												<input
													type="number"
													step="0.1"
													class="w-20 border-none bg-surface-700 px-2 py-2 text-center text-sm"
													value={measurement.openCircuitVoltage ?? ''}
													oninput={(e) =>
														store.updateDcMeasurement(measurement.id, {
															openCircuitVoltage: parseNum(e.currentTarget.value)
														})}
												/>
											</td>
											<td class="px-1.5 py-1.5">
												<input
													type="number"
													step="0.01"
													class="w-20 border-none bg-surface-700 px-2 py-2 text-center text-sm"
													value={measurement.operatingCurrent ?? ''}
													oninput={(e) =>
														store.updateDcMeasurement(measurement.id, {
															operatingCurrent: parseNum(e.currentTarget.value)
														})}
												/>
											</td>
											<td class="px-1.5 py-1.5">
												<input
													type="number"
													step="0.1"
													class="w-20 border-none bg-surface-700 px-2 py-2 text-center text-sm"
													value={measurement.stringRiso ?? ''}
													oninput={(e) =>
														store.updateDcMeasurement(measurement.id, {
															stringRiso: parseNum(e.currentTarget.value)
														})}
												/>
											</td>
											<td class="px-1.5 py-1.5">
												<input
													type="number"
													step="0.1"
													class="w-20 border-none bg-surface-700 px-2 py-2 text-center text-sm"
													value={measurement.feedRisoNegative ?? ''}
													oninput={(e) =>
														store.updateDcMeasurement(measurement.id, {
															feedRisoNegative: parseNum(e.currentTarget.value)
														})}
												/>
											</td>
											<td class="px-1.5 py-1.5">
												<input
													type="number"
													step="0.1"
													class="w-20 border-none bg-surface-700 px-2 py-2 text-center text-sm"
													value={measurement.feedRisoPositive ?? ''}
													oninput={(e) =>
														store.updateDcMeasurement(measurement.id, {
															feedRisoPositive: parseNum(e.currentTarget.value)
														})}
												/>
											</td>
										</tr>
									{/if}
								{/each}
							</tbody>
						</table>
					</div>

					<!-- Add top-level string button -->
					<div class="border-t border-border/30 p-2">
						<button
							type="button"
							class="flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-sm text-gray-500 transition-colors active:bg-surface-700 active:text-gray-300"
							onclick={() => handleAddString(config.index)}
						>
							<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
							</svg>
							<span>מחרוזת</span>
						</button>
					</div>
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
