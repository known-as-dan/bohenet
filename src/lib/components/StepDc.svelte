<script lang="ts">
	import { slide } from 'svelte/transition';
	import { haptic } from '$lib/utils/haptics.js';
	import type { createInspectionStore } from '$lib/stores/inspection.svelte.js';
	import type { DcStringMeasurement } from '$lib/models/inspection.js';

	let { store }: { store: ReturnType<typeof createInspectionStore> } = $props();

	let expandedInverters = $state<Record<number, boolean>>({});

	$effect(() => {
		for (const c of store.inspection.inverterConfigs) {
			if (!(c.index in expandedInverters)) {
				expandedInverters[c.index] = true;
			}
		}
	});

	function getChildren(inverterIndex: number, parentId: string | null): DcStringMeasurement[] {
		return store.inspection.dcMeasurements.filter(
			(m) => m.inverterIndex === inverterIndex && m.parentId === parentId
		);
	}

	function toggleInverter(index: number) {
		haptic('light');
		expandedInverters[index] = !expandedInverters[index];
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
		store.addDcSubstring(parentId);
	}

	function handleAddSibling(id: string) {
		const m = store.inspection.dcMeasurements.find((d) => d.id === id);
		if (!m?.parentId) return;
		haptic('medium');
		store.addDcSubstring(m.parentId);
	}

	function handleRemove(id: string) {
		haptic('warning');
		store.removeDcMeasurement(id);
	}
</script>

{#snippet stringCard(m: DcStringMeasurement, depth: number, inverterIndex: number)}
	{@const children = getChildren(inverterIndex, m.id)}
	<div class="rounded-lg border border-border/40 bg-surface-800 p-2.5">
		<!-- Label row -->
		<div class="mb-2 flex items-center gap-2">
			<span
				class="inline-flex h-6 min-w-6 items-center justify-center rounded bg-surface-600 px-1.5 text-xs font-bold {depth > 0 ? 'text-gray-400' : 'text-gray-200'}"
			>
				{m.stringLabel}
			</span>
			<div class="flex-1"></div>
			{#if depth > 0}
				<button
					type="button"
					class="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-gray-600 transition-colors hover:text-accent active:text-accent"
					onclick={() => handleAddSibling(m.id)}
				>
					<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
					</svg>
				</button>
				<button
					type="button"
					class="flex items-center rounded px-1.5 py-0.5 text-xs text-gray-600 transition-colors hover:text-danger active:text-danger"
					onclick={() => handleRemove(m.id)}
				>
					<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			{/if}
			{#if depth < 2}
				<button
					type="button"
					class="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs text-gray-600 transition-colors hover:text-accent active:text-accent"
					title="תת-מחרוזת"
					onclick={() => handleAddChild(m.id)}
				>
					<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
					</svg>
					<span>תת</span>
				</button>
			{/if}
		</div>

		<!-- 3x2 input grid — always visible -->
		<div class="grid grid-cols-3 gap-x-2 gap-y-1.5">
			<label class="space-y-0.5">
				<span class="text-[10px] leading-none text-gray-500">קולטים</span>
				<input
					type="number"
					inputmode="numeric"
					class="w-full rounded border-none bg-surface-700 px-1.5 py-1.5 text-center text-sm"
					placeholder="—"
					value={m.panelCount ?? ''}
					oninput={(e) =>
						store.updateDcMeasurement(m.id, { panelCount: parseNum(e.currentTarget.value) })}
				/>
			</label>
			<label class="space-y-0.5">
				<span class="text-[10px] leading-none text-gray-500">מתח V</span>
				<input
					type="number"
					inputmode="decimal"
					step="0.1"
					class="w-full rounded border-none bg-surface-700 px-1.5 py-1.5 text-center text-sm"
					placeholder="—"
					value={m.openCircuitVoltage ?? ''}
					oninput={(e) =>
						store.updateDcMeasurement(m.id, {
							openCircuitVoltage: parseNum(e.currentTarget.value)
						})}
				/>
			</label>
			<label class="space-y-0.5">
				<span class="text-[10px] leading-none text-gray-500">זרם A</span>
				<input
					type="number"
					inputmode="decimal"
					step="0.01"
					class="w-full rounded border-none bg-surface-700 px-1.5 py-1.5 text-center text-sm"
					placeholder="—"
					value={m.operatingCurrent ?? ''}
					oninput={(e) =>
						store.updateDcMeasurement(m.id, {
							operatingCurrent: parseNum(e.currentTarget.value)
						})}
				/>
			</label>
			<label class="space-y-0.5">
				<span class="text-[10px] leading-none text-gray-500">בידוד M&Omega;</span>
				<input
					type="number"
					inputmode="decimal"
					step="0.1"
					class="w-full rounded border-none bg-surface-700 px-1.5 py-1.5 text-center text-sm"
					placeholder="—"
					value={m.stringRiso ?? ''}
					oninput={(e) =>
						store.updateDcMeasurement(m.id, { stringRiso: parseNum(e.currentTarget.value) })}
				/>
			</label>
			<label class="space-y-0.5">
				<span class="text-[10px] leading-none text-gray-500">הזנה &minus; M&Omega;</span>
				<input
					type="number"
					inputmode="decimal"
					step="0.1"
					class="w-full rounded border-none bg-surface-700 px-1.5 py-1.5 text-center text-sm"
					placeholder="—"
					value={m.feedRisoNegative ?? ''}
					oninput={(e) =>
						store.updateDcMeasurement(m.id, {
							feedRisoNegative: parseNum(e.currentTarget.value)
						})}
				/>
			</label>
			<label class="space-y-0.5">
				<span class="text-[10px] leading-none text-gray-500">הזנה + M&Omega;</span>
				<input
					type="number"
					inputmode="decimal"
					step="0.1"
					class="w-full rounded border-none bg-surface-700 px-1.5 py-1.5 text-center text-sm"
					placeholder="—"
					value={m.feedRisoPositive ?? ''}
					oninput={(e) =>
						store.updateDcMeasurement(m.id, {
							feedRisoPositive: parseNum(e.currentTarget.value)
						})}
				/>
			</label>
		</div>

		<!-- Children (substrings) -->
		{#if children.length > 0}
			<div class="mt-2 space-y-2 border-t border-border/20 pt-2" style="padding-inline-start: 6px">
				{#each children as child (child.id)}
					{@render stringCard(child, depth + 1, inverterIndex)}
				{/each}
			</div>
		{/if}
	</div>
{/snippet}

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
				class="flex w-full items-center justify-between p-3 text-start transition-colors hover:bg-surface-700 active:bg-surface-700"
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
				<div class="space-y-2 border-t border-border p-2" transition:slide={{ duration: 300 }}>
					{#each getChildren(config.index, null) as m (m.id)}
						{@render stringCard(m, 0, config.index)}
					{/each}

					<!-- Add top-level string -->
					<button
						type="button"
						class="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/50 py-2 text-sm text-gray-500 transition-colors hover:border-gray-500 hover:text-gray-300 active:border-gray-500 active:text-gray-300"
						onclick={() => handleAddString(config.index)}
					>
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
						</svg>
						<span>מחרוזת</span>
					</button>
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
