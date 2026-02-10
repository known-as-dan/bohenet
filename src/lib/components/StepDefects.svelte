<script lang="ts">
	import type { createInspectionStore } from '$lib/stores/inspection.svelte.js';
	import { defectComponentOptions } from '$lib/config/ac.js';

	let { store }: { store: ReturnType<typeof createInspectionStore> } = $props();
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h2 class="text-xl font-bold">ריכוז ליקויים</h2>
		<button
			type="button"
			class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
			onclick={() => store.addDefect()}
		>
			+ הוסף ליקוי
		</button>
	</div>

	{#if store.inspection.defects.length === 0}
		<p class="py-8 text-center text-gray-500">לא נרשמו ליקויים. לחץ "הוסף ליקוי" להוספת רשומה.</p>
	{/if}

	{#each store.inspection.defects as defect, i (i)}
		<div class="space-y-3 rounded-lg border border-gray-200 p-4">
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium text-gray-500">ליקוי #{i + 1}</span>
				<div class="flex gap-2">
					<button
						type="button"
						class="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
						onclick={() => store.duplicateDefect(i)}
					>
						שכפל
					</button>
					<button
						type="button"
						class="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
						onclick={() => store.removeDefect(i)}
					>
						מחק
					</button>
				</div>
			</div>

			<div>
				<label for="defect-comp-{i}" class="mb-1 block text-sm">רכיב</label>
				<select
					id="defect-comp-{i}"
					class="block w-full rounded border-gray-300 text-sm shadow-sm"
					value={defect.component}
					onchange={(e) => {
						defect.component = e.currentTarget.value;
						store.save();
					}}
				>
					<option value="">בחר רכיב...</option>
					{#each defectComponentOptions as opt}
						<option value={opt}>{opt}</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="defect-fault-{i}" class="mb-1 block text-sm">תקלה</label>
				<textarea
					id="defect-fault-{i}"
					class="block w-full rounded border-gray-300 text-sm shadow-sm"
					rows="2"
					placeholder="תאר את התקלה..."
					value={defect.fault}
					oninput={(e) => {
						defect.fault = e.currentTarget.value;
						store.save();
					}}
				></textarea>
			</div>

			<div>
				<label for="defect-loc-{i}" class="mb-1 block text-sm">מיקום במערכת</label>
				<input
					id="defect-loc-{i}"
					type="text"
					class="block w-full rounded border-gray-300 text-sm shadow-sm"
					placeholder="מיקום..."
					value={defect.location}
					oninput={(e) => {
						defect.location = e.currentTarget.value;
						store.save();
					}}
				/>
			</div>

			<div>
				<label for="defect-status-{i}" class="mb-1 block text-sm">סטטוס</label>
				<textarea
					id="defect-status-{i}"
					class="block w-full rounded border-gray-300 text-sm shadow-sm"
					rows="2"
					placeholder="מה נעשה / נדרש..."
					value={defect.status}
					oninput={(e) => {
						defect.status = e.currentTarget.value;
						store.save();
					}}
				></textarea>
			</div>
		</div>
	{/each}
</div>
