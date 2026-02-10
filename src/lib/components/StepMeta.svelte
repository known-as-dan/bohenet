<script lang="ts">
	import type { createInspectionStore } from '$lib/stores/inspection.svelte.js';

	let { store }: { store: ReturnType<typeof createInspectionStore> } = $props();
</script>

<div class="space-y-6">
	<h2 class="text-xl font-bold">פרטי בדיקה</h2>

	<div class="space-y-4">
		<div>
			<label for="siteName" class="mb-1 block text-sm font-medium">שם אתר</label>
			<input
				id="siteName"
				type="text"
				class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
				value={store.inspection.meta.siteName}
				oninput={(e) => store.updateMeta({ siteName: e.currentTarget.value })}
				placeholder="הזן שם אתר"
			/>
		</div>

		<div>
			<label for="inspectionDate" class="mb-1 block text-sm font-medium">תאריך בדיקה</label>
			<input
				id="inspectionDate"
				type="date"
				class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
				value={store.inspection.meta.inspectionDate}
				oninput={(e) => store.updateMeta({ inspectionDate: e.currentTarget.value })}
			/>
		</div>

		<div>
			<label for="inspectorName" class="mb-1 block text-sm font-medium">שם בודק</label>
			<input
				id="inspectorName"
				type="text"
				class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
				value={store.inspection.meta.inspectorName}
				oninput={(e) => store.updateMeta({ inspectorName: e.currentTarget.value })}
				placeholder="הזן שם בודק"
			/>
		</div>

		<div>
			<label for="signature" class="mb-1 block text-sm font-medium">חתימה (אופציונלי)</label>
			<input
				id="signature"
				type="text"
				class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
				value={store.inspection.meta.signatureText ?? ''}
				oninput={(e) => store.updateMeta({ signatureText: e.currentTarget.value })}
				placeholder="טקסט חתימה"
			/>
		</div>
	</div>
</div>
