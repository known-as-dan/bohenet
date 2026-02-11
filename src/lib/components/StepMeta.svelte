<script lang="ts">
	import type { createInspectionStore } from '$lib/stores/inspection.svelte.js';

	let { store }: { store: ReturnType<typeof createInspectionStore> } = $props();
</script>

<div class="space-y-4">
	<div class="space-y-1">
		<h2 class="text-lg font-bold text-white">פרטי בדיקה</h2>
		<p class="text-sm text-gray-400">מלא את פרטי האתר והבודק</p>
	</div>

	<div class="space-y-4">
		<div>
			<label for="siteName" class="mb-1.5 block text-sm font-medium text-gray-300">שם אתר</label>
			<input
				id="siteName"
				type="text"
				class="block w-full px-3 py-2"
				value={store.inspection.meta.siteName}
				oninput={(e) => store.updateMeta({ siteName: e.currentTarget.value })}
				placeholder="לדוגמה: מפעל שמש - חיפה"
			/>
		</div>

		<div>
			<label for="inspectionDate" class="mb-1.5 block text-sm font-medium text-gray-300"
				>תאריך בדיקה</label
			>
			<input
				id="inspectionDate"
				type="date"
				class="block w-full px-3 py-2"
				value={store.inspection.meta.inspectionDate}
				oninput={(e) => store.updateMeta({ inspectionDate: e.currentTarget.value })}
			/>
		</div>

		<div>
			<label for="inspectorName" class="mb-1.5 block text-sm font-medium text-gray-300"
				>שם בודק</label
			>
			<input
				id="inspectorName"
				type="text"
				class="block w-full px-3 py-2"
				value={store.inspection.meta.inspectorName}
				oninput={(e) => store.updateMeta({ inspectorName: e.currentTarget.value })}
				placeholder="שם מלא"
			/>
		</div>

		<div>
			<label for="signature" class="mb-1.5 block text-sm font-medium text-gray-300"
				>חתימה <span class="text-gray-500">(אופציונלי)</span></label
			>
			<input
				id="signature"
				type="text"
				class="block w-full px-3 py-2"
				value={store.inspection.meta.signatureText ?? ''}
				oninput={(e) => store.updateMeta({ signatureText: e.currentTarget.value })}
				placeholder="טקסט חתימה"
			/>
		</div>
	</div>

	<!-- Report name -->
	<div class="rounded-xl border border-border bg-surface-800 p-4">
		<label for="reportName" class="mb-1.5 block text-sm font-medium text-gray-300"
			>שם הדוח</label
		>
		<input
			id="reportName"
			type="text"
			class="block w-full px-3 py-2"
			value={store.report.name}
			oninput={(e) => store.updateReportName(e.currentTarget.value)}
			placeholder="שם לזיהוי הדוח"
		/>
		<p class="mt-1.5 text-xs text-gray-500">שם זה מוצג ברשימת הדוחות השמורים</p>
	</div>
</div>