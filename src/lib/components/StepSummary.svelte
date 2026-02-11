<script lang="ts">
	import type { createInspectionStore } from '$lib/stores/inspection.svelte.js';
	import { downloadWorkbook } from '$lib/mappers/excel.js';
	import { haptic } from '$lib/utils/haptics.js';

	let { store, ondashboard }: { store: ReturnType<typeof createInspectionStore>; ondashboard?: () => void } = $props();

	let exportState = $state<'idle' | 'exporting' | 'success' | 'error'>('idle');

	const totalChecklist = $derived(store.inspection.checklist.length);
	const doneChecklist = $derived(
		store.inspection.checklist.filter((c) => c.status != null).length
	);
	const passedChecklist = $derived(
		store.inspection.checklist.filter((c) => c.status === 'תקין').length
	);
	const failedChecklist = $derived(
		store.inspection.checklist.filter((c) => c.status === 'לא תקין').length
	);

	const totalDc = $derived(store.inspection.dcMeasurements.length);
	const filledDc = $derived(
		store.inspection.dcMeasurements.filter((m) => m.openCircuitVoltage != null).length
	);

	const totalAc = $derived(store.inspection.acMeasurements.length);
	const filledAc = $derived(
		store.inspection.acMeasurements.filter((m) => m.result != null).length
	);

	const defectCount = $derived(store.allDefects.length);

	const warnings = $derived(() => {
		const w: string[] = [];
		if (!store.inspection.meta.siteName) w.push('לא הוזן שם אתר');
		if (!store.inspection.meta.inspectorName) w.push('לא הוזן שם בודק');
		if (!store.inspection.meta.inspectionDate) w.push('לא הוזן תאריך');
		if (doneChecklist < totalChecklist)
			w.push(`${totalChecklist - doneChecklist} פריטי צ׳קליסט לא מולאו`);
		if (filledDc < totalDc) w.push(`${totalDc - filledDc} מדידות DC חסרות`);
		if (filledAc < totalAc) w.push(`${totalAc - filledAc} מדידות AC חסרות`);
		if (failedChecklist > 0) w.push(`${failedChecklist} פריטים נכשלו בצ׳קליסט`);
		return w;
	});

	async function handleExport() {
		exportState = 'exporting';
		haptic('medium');
		try {
			await downloadWorkbook(store.inspection, store.allDefects);
			exportState = 'success';
			haptic('success');
			setTimeout(() => {
				exportState = 'idle';
			}, 2000);
		} catch (err) {
			console.error('Export failed:', err);
			exportState = 'error';
			haptic('error');
			setTimeout(() => {
				exportState = 'idle';
			}, 2500);
		}
	}
</script>

<div class="space-y-4">
	<div>
		<h2 class="text-lg font-bold text-white">סיכום ויצוא</h2>
		<p class="text-sm text-gray-400">סקירת הדוח ויצוא לאקסל</p>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-2 gap-3">
		<div class="rounded-xl border border-border bg-surface-800 p-3 text-center">
			<div class="text-2xl font-bold text-accent">{doneChecklist}/{totalChecklist}</div>
			<div class="mt-1 text-xs text-gray-400">צ׳קליסט</div>
			<div class="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-600">
				<div
					class="h-full rounded-full bg-accent transition-all"
					style="width: {totalChecklist > 0
						? (doneChecklist / totalChecklist) * 100
						: 0}%"
				></div>
			</div>
		</div>

		<div class="rounded-xl border border-border bg-surface-800 p-3 text-center">
			<div class="text-2xl font-bold text-ok">{passedChecklist}</div>
			<div class="mt-1 text-xs text-gray-400">עברו בהצלחה</div>
			{#if failedChecklist > 0}
				<div class="mt-2 text-sm font-semibold text-danger">{failedChecklist} נכשלו</div>
			{/if}
		</div>

		<div class="rounded-xl border border-border bg-surface-800 p-3 text-center">
			<div class="text-2xl font-bold text-accent">{filledDc}/{totalDc}</div>
			<div class="mt-1 text-xs text-gray-400">מדידות DC</div>
			<div class="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-600">
				<div
					class="h-full rounded-full bg-accent transition-all"
					style="width: {totalDc > 0 ? (filledDc / totalDc) * 100 : 0}%"
				></div>
			</div>
		</div>

		<div class="rounded-xl border border-border bg-surface-800 p-3 text-center">
			<div class="text-2xl font-bold text-accent">{filledAc}/{totalAc}</div>
			<div class="mt-1 text-xs text-gray-400">מדידות AC</div>
			<div class="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-600">
				<div
					class="h-full rounded-full bg-accent transition-all"
					style="width: {totalAc > 0 ? (filledAc / totalAc) * 100 : 0}%"
				></div>
			</div>
		</div>
	</div>

	<!-- Defects summary -->
	<div class="rounded-xl border border-border bg-surface-800 p-3">
		<div class="flex items-center gap-2">
			<span class="text-lg">{defectCount > 0 ? '⚠️' : '✅'}</span>
			<span class="font-semibold text-white">
				{defectCount > 0 ? `${defectCount} ליקויים תועדו` : 'לא נמצאו ליקויים'}
			</span>
		</div>
	</div>

	<!-- Site info card -->
	{#if store.inspection.meta.siteName}
		<div class="rounded-xl border border-border bg-surface-800 p-3">
			<h3 class="mb-2 text-sm font-semibold text-gray-400">פרטי אתר</h3>
			<div class="space-y-1 text-sm text-gray-300">
				{#if store.inspection.meta.siteName}
					<div><span class="text-gray-500">אתר:</span> {store.inspection.meta.siteName}</div>
				{/if}
				{#if store.inspection.meta.inspectorName}
					<div>
						<span class="text-gray-500">בודק:</span>
						{store.inspection.meta.inspectorName}
					</div>
				{/if}
				{#if store.inspection.meta.inspectionDate}
					<div><span class="text-gray-500">תאריך:</span> {store.inspection.meta.inspectionDate}</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Warnings -->
	{#if warnings().length > 0}
		<div class="rounded-xl border border-warn/30 bg-warn/5 p-3">
			<h3 class="mb-2 text-sm font-semibold text-warn">⚠ שים לב</h3>
			<ul class="space-y-1">
				{#each warnings() as w}
					<li class="flex items-start gap-2 text-sm text-gray-300">
						<span class="mt-0.5 text-warn">•</span>
						{w}
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- Export button -->
	<button
		type="button"
		class="w-full rounded-xl px-4 py-3 text-center font-bold text-white shadow-lg transition-all active:scale-[.98] disabled:opacity-50 {exportState === 'success' ? 'bg-ok animate-success-pulse' : exportState === 'error' ? 'bg-danger animate-shake-x' : 'bg-ok/90 hover:bg-ok active:bg-ok'}"
		onclick={handleExport}
		disabled={exportState === 'exporting'}
	>
		{#if exportState === 'exporting'}
			<span class="inline-block animate-spin">⏳</span> מייצא...
		{:else if exportState === 'success'}
			✓ יוצא בהצלחה!
		{:else if exportState === 'error'}
			✗ שגיאה בייצוא
		{:else}
			📥 ייצוא לאקסל
		{/if}
	</button>

	<!-- Back to dashboard -->
	{#if ondashboard}
		<button
			type="button"
			class="w-full rounded-xl border border-border bg-surface-800 px-4 py-2.5 text-center text-sm text-gray-400 transition-colors hover:bg-surface-700 hover:text-white active:bg-surface-700 active:text-white"
			onclick={ondashboard}
		>
			חזרה לרשימת דוחות
		</button>
	{/if}
</div>