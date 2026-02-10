<script lang="ts">
	import type { createInspectionStore } from '$lib/stores/inspection.svelte.js';
	import { downloadWorkbook } from '$lib/mappers/excel.js';

	let { store }: { store: ReturnType<typeof createInspectionStore> } = $props();

	let warnings = $derived.by(() => {
		const w: string[] = [];
		const { meta, checklist, dcMeasurements, inverterConfigs } = store.inspection;

		if (!meta.siteName) w.push('שם אתר חסר');
		if (!meta.inspectionDate) w.push('תאריך בדיקה חסר');
		if (!meta.inspectorName) w.push('שם בודק חסר');

		const unfilled = checklist.filter((c) => !c.status).length;
		if (unfilled > 0) w.push(`${unfilled} פריטי בדיקה ללא סטטוס`);

		const notOk = checklist.filter((c) => c.status === 'לא תקין').length;
		if (notOk > 0) w.push(`${notOk} פריטים סומנו "לא תקין"`);

		if (inverterConfigs.length > 0) {
			const emptyDc = dcMeasurements.filter(
				(d) => d.openCircuitVoltage === undefined && d.operatingCurrent === undefined
			).length;
			if (emptyDc > 0) w.push(`${emptyDc} מדידות DC ריקות`);
		}

		return w;
	});

	let defectCount = $derived(store.inspection.defects.length);
	let checklistDone = $derived(store.inspection.checklist.filter((c) => c.status).length);
	let checklistTotal = $derived(store.inspection.checklist.length);

	function handleExport() {
		downloadWorkbook(store.inspection);
	}

	function handleReset() {
		if (confirm('האם אתה בטוח שברצונך למחוק את כל הנתונים ולהתחיל מחדש?')) {
			store.resetInspection();
		}
	}
</script>

<div class="space-y-6">
	<h2 class="text-xl font-bold">סיכום וייצוא</h2>

	<!-- Summary cards -->
	<div class="grid grid-cols-2 gap-3">
		<div class="rounded-lg bg-blue-50 p-4 text-center">
			<div class="text-2xl font-bold text-blue-700">{checklistDone}/{checklistTotal}</div>
			<div class="text-sm text-blue-600">פריטי בדיקה</div>
		</div>
		<div class="rounded-lg bg-orange-50 p-4 text-center">
			<div class="text-2xl font-bold text-orange-700">{defectCount}</div>
			<div class="text-sm text-orange-600">ליקויים</div>
		</div>
		<div class="rounded-lg bg-green-50 p-4 text-center">
			<div class="text-2xl font-bold text-green-700">
				{store.inspection.inverterConfigs.length}
			</div>
			<div class="text-sm text-green-600">ממירים</div>
		</div>
		<div class="rounded-lg bg-purple-50 p-4 text-center">
			<div class="text-2xl font-bold text-purple-700">
				{store.inspection.dcMeasurements.length}
			</div>
			<div class="text-sm text-purple-600">מדידות DC</div>
		</div>
	</div>

	<!-- Warnings -->
	{#if warnings.length > 0}
		<div class="rounded-lg border border-amber-200 bg-amber-50 p-4">
			<h3 class="mb-2 font-semibold text-amber-800">אזהרות</h3>
			<ul class="list-inside list-disc space-y-1 text-sm text-amber-700">
				{#each warnings as warning}
					<li>{warning}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- Site info -->
	<div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
		<h3 class="mb-2 font-semibold">פרטי בדיקה</h3>
		<dl class="grid grid-cols-2 gap-2 text-sm">
			<dt class="text-gray-500">אתר:</dt>
			<dd>{store.inspection.meta.siteName || '—'}</dd>
			<dt class="text-gray-500">תאריך:</dt>
			<dd>{store.inspection.meta.inspectionDate || '—'}</dd>
			<dt class="text-gray-500">בודק:</dt>
			<dd>{store.inspection.meta.inspectorName || '—'}</dd>
		</dl>
	</div>

	<!-- Actions -->
	<div class="flex flex-col gap-3">
		<button
			type="button"
			class="w-full rounded-lg bg-green-600 px-6 py-3 text-center text-lg font-bold text-white shadow-sm hover:bg-green-700"
			onclick={handleExport}
		>
			ייצוא לאקסל
		</button>

		<button
			type="button"
			class="w-full rounded-lg border border-red-300 px-6 py-2 text-center text-sm text-red-600 hover:bg-red-50"
			onclick={handleReset}
		>
			מחק הכל והתחל מחדש
		</button>
	</div>
</div>
