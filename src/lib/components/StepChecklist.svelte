<script lang="ts">
	import type { createInspectionStore } from '$lib/stores/inspection.svelte.js';
	import { checklistSections } from '$lib/config/checklist.js';

	let { store }: { store: ReturnType<typeof createInspectionStore> } = $props();

	let expandedSections = $state<Record<string, boolean>>(
		Object.fromEntries(checklistSections.map((s) => [s.code, true]))
	);

	function toggleSection(code: string) {
		expandedSections[code] = !expandedSections[code];
	}

	function getFilledCount(sectionCode: string): number {
		return store.inspection.checklist.filter(
			(c) => c.sectionCode.startsWith(sectionCode + '.') && c.status
		).length;
	}

	function getTotalCount(sectionCode: string): number {
		return store.inspection.checklist.filter((c) =>
			c.sectionCode.startsWith(sectionCode + '.')
		).length;
	}

	let totalFilled = $derived(store.inspection.checklist.filter((c) => c.status).length);
	let totalItems = $derived(store.inspection.checklist.length);
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h2 class="text-xl font-bold">בדיקות חזותיות</h2>
		<span class="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
			{totalFilled}/{totalItems}
		</span>
	</div>

	{#each checklistSections as section (section.code)}
		{@const filled = getFilledCount(section.code)}
		{@const total = getTotalCount(section.code)}
		<div class="overflow-hidden rounded-lg border border-gray-200">
			<div class="flex w-full items-center justify-between bg-gray-50 p-3">
				<button
					type="button"
					class="flex items-center gap-2 text-start"
					onclick={() => toggleSection(section.code)}
				>
					<span class="text-lg">{expandedSections[section.code] ? '▾' : '▸'}</span>
					<span class="font-semibold">{section.code}. {section.title}</span>
				</button>
				<div class="flex items-center gap-2">
					<span
						class="rounded-full px-2 py-0.5 text-xs font-medium {filled === total
							? 'bg-green-100 text-green-800'
							: 'bg-gray-200 text-gray-600'}"
					>
						{filled}/{total}
					</span>
					<button
						type="button"
						class="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 hover:bg-green-200"
						onclick={() => store.markSectionAllOk(section.code)}
					>
						הכל תקין
					</button>
				</div>
			</div>

			{#if expandedSections[section.code]}
				<div class="divide-y divide-gray-100">
					{#each section.items as item (item.sectionCode)}
						{@const checklist = store.inspection.checklist.find(
							(c) => c.sectionCode === item.sectionCode
						)}
						<div
							class="p-3 {checklist?.status === 'לא תקין' ? 'bg-red-50' : ''}"
						>
							<div class="mb-2 flex items-start gap-2">
								<span class="mt-0.5 text-sm font-medium text-gray-500"
									>{item.sectionCode}</span
								>
								<span class="text-sm">{item.description}</span>
							</div>
							<div class="flex flex-wrap gap-2">
								{#each ['תקין', 'לא תקין', '-'] as status}
									<label
										class="flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors {checklist?.status === status ? (status === 'תקין' ? 'border-green-500 bg-green-50 text-green-700' : status === 'לא תקין' ? 'border-red-500 bg-red-50 text-red-700' : 'border-blue-500 bg-blue-50 text-blue-700') : 'border-gray-300 hover:bg-gray-50'}"
									>
										<input
											type="radio"
											name="status-{item.sectionCode}"
											class="sr-only"
											checked={checklist?.status === status}
											onchange={() =>
												store.updateChecklistItem(item.sectionCode, status)}
										/>
										{status}
									</label>
								{/each}
							</div>
							<div class="mt-2">
								<input
									type="text"
									class="block w-full rounded border-gray-300 text-sm shadow-sm"
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
