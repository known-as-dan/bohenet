<script lang="ts">
	import { slide } from 'svelte/transition';
	import { haptic } from '$lib/utils/haptics.js';
	import type { createInspectionStore } from '$lib/stores/inspection.svelte.js';
	import { checklistSections } from '$lib/config/checklist.js';

	let { store }: { store: ReturnType<typeof createInspectionStore> } = $props();

	let expandedSections = $state<Record<string, boolean>>(
		Object.fromEntries(checklistSections.map((s) => [s.code, true]))
	);

	function toggleSection(code: string) {
		haptic('light');
		expandedSections[code] = !expandedSections[code];
	}

	function getFilledCount(sectionCode: string): number {
		return store.inspection.checklist.filter(
			(c) => c.sectionCode.startsWith(sectionCode + '.') && c.status
		).length;
	}

	function getFaultCount(sectionCode: string): number {
		return store.inspection.checklist.filter(
			(c) => c.sectionCode.startsWith(sectionCode + '.') && c.status === 'לא תקין'
		).length;
	}

	function getTotalCount(sectionCode: string): number {
		return store.inspection.checklist.filter((c) =>
			c.sectionCode.startsWith(sectionCode + '.')
		).length;
	}

	let totalFilled = $derived(store.inspection.checklist.filter((c) => c.status).length);
	let totalFaults = $derived(store.inspection.checklist.filter((c) => c.status === 'לא תקין').length);
	let totalItems = $derived(store.inspection.checklist.length);

	const sectionIcons: Record<string, string> = {
		'1': '🔆',
		'2': '🏗️',
		'3': '🔌',
		'4': '⚡',
		'5': '📦',
		'6': '🔗',
		'7': '🛡️',
		'8': '📡',
		'9': '🔍'
	};
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-lg font-bold text-white">בדיקות חזותיות</h2>
			<p class="text-sm text-gray-400">סקירת תקינות רכיבי המערכת</p>
		</div>
		<div class="flex items-center gap-2">
			{#if totalFaults > 0}
				<div class="flex items-center gap-1.5 rounded-full bg-danger-dim px-3 py-1.5 text-sm font-semibold text-danger">
					<div class="h-2 w-2 rounded-full bg-danger"></div>
					{totalFaults} תקלות
				</div>
			{/if}
			<div
				class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold {totalFilled === totalItems && totalFaults === 0 ? 'bg-ok-dim text-ok' : totalFilled === totalItems ? 'bg-warn-dim text-warn' : 'bg-accent-dim text-accent'}"
			>
				<div
					class="h-2 w-2 rounded-full {totalFilled === totalItems && totalFaults === 0 ? 'bg-ok' : totalFilled === totalItems ? 'bg-warn' : 'bg-accent'}"
				></div>
				{totalFilled}/{totalItems}
			</div>
		</div>
	</div>

	{#each checklistSections as section (section.code)}
		{@const filled = getFilledCount(section.code)}
		{@const faults = getFaultCount(section.code)}
		{@const total = getTotalCount(section.code)}
		{@const complete = filled === total}
		{@const allOk = complete && faults === 0}
		<div class="overflow-hidden rounded-xl border {faults > 0 ? 'border-danger/30' : 'border-border'} bg-surface-800">
			<div class="flex items-center justify-between p-3">
				<button
					type="button"
					class="flex flex-1 items-center gap-2.5 rounded-lg text-start transition-colors hover:bg-surface-700"
					onclick={() => toggleSection(section.code)}
				>
					<span class="text-lg">{sectionIcons[section.code] || '📋'}</span>
					<div>
						<span class="font-semibold text-white"
							>{section.code}. {section.title}</span
						>
						<div class="mt-0.5 flex h-1 w-20 overflow-hidden rounded-full bg-surface-600">
							{#if filled - faults > 0}
								<div
									class="h-full bg-ok transition-all"
									style="width: {((filled - faults) / total) * 100}%"
								></div>
							{/if}
							{#if faults > 0}
								<div
									class="h-full bg-danger transition-all"
									style="width: {(faults / total) * 100}%"
								></div>
							{/if}
						</div>
					</div>
				</button>
				<div class="flex items-center gap-2">
					{#if faults > 0}
						<span class="rounded-md px-2 py-0.5 text-xs font-medium bg-danger-dim text-danger">
							{faults} תקלות
						</span>
					{/if}
					<span
						class="rounded-md px-2 py-0.5 text-xs font-medium {allOk
							? 'bg-ok-dim text-ok'
							: complete
								? 'bg-warn-dim text-warn'
								: 'bg-surface-600 text-gray-400'}"
					>
						{filled}/{total}
					</span>
				</div>
			</div>

			{#if expandedSections[section.code]}
				<div class="border-t border-border" transition:slide={{ duration: 300 }}>
					{#each section.items as item, idx (item.sectionCode)}
						{@const checklist = store.inspection.checklist.find(
							(c) => c.sectionCode === item.sectionCode
						)}
						<div
							class="border-b border-border/50 p-3 last:border-b-0 {checklist?.status ===
							'לא תקין'
								? 'bg-danger-dim/50'
								: idx % 2 === 0
									? 'bg-surface-800'
									: 'bg-surface-800/50'}"
						>
							<div class="mb-2 flex items-start gap-2">
								<span
									class="mt-0.5 rounded bg-surface-600 px-1.5 py-0.5 text-xs font-mono text-gray-400"
									>{item.sectionCode}</span
								>
								<span class="text-sm text-gray-200">{item.description}</span>
							</div>
							<div class="flex flex-wrap gap-1.5">
								{#each [{ label: 'תקין', style: 'ok' }, { label: 'לא תקין', style: 'danger' }, { label: 'ל.ק.', style: 'neutral' }] as opt}
									{@const selected = checklist?.status === opt.label}
									<label
										class="flex cursor-pointer items-center gap-1 rounded-lg border px-3 py-1.5 text-sm transition-all {selected
											? opt.style === 'ok'
												? 'border-ok bg-ok-dim text-ok'
												: opt.style === 'danger'
													? 'border-danger bg-danger-dim text-danger'
													: 'border-accent bg-accent-dim text-accent'
											: 'border-border text-gray-400 hover:border-border-light hover:text-gray-300 active:border-border-light active:text-gray-300'}"
									>
										<input
											type="radio"
											name="status-{item.sectionCode}"
											class="sr-only"
											checked={selected}
											onchange={() =>
												store.updateChecklistItem(
													item.sectionCode,
													opt.label
												)}
										/>
										{#if selected && opt.style === 'ok'}✓{/if}
										{#if selected && opt.style === 'danger'}✗{/if}
										{opt.label}
									</label>
								{/each}
							</div>
							<div class="mt-2">
								<input
									type="text"
									class="block w-full border-none bg-surface-700 px-2.5 py-1.5 text-sm"
									placeholder="הערות..."
									value={checklist?.notes ?? ''}
									oninput={(e) =>
										store.updateChecklistItem(
											item.sectionCode,
											undefined,
											e.currentTarget.value
										)}
								/>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/each}
</div>