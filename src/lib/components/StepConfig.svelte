<script lang="ts">
	import type { createInspectionStore } from '$lib/stores/inspection.svelte.js';

	let { store }: { store: ReturnType<typeof createInspectionStore> } = $props();

	let inverterCount = $state(store.inspection.inverterConfigs.length || 3);
	let defaultStrings = $state(9);

	function applyConfig() {
		store.setInverterConfigs(inverterCount, defaultStrings);
	}

	// Initialize on first visit if no configs yet
	$effect(() => {
		if (store.inspection.inverterConfigs.length === 0) {
			applyConfig();
		}
	});
</script>

<div class="space-y-6">
	<h2 class="text-xl font-bold">הגדרת מערכת</h2>

	<div class="space-y-4">
		<div>
			<label for="inverterCount" class="mb-1 block text-sm font-medium">מספר ממירים</label>
			<input
				id="inverterCount"
				type="number"
				min="1"
				max="50"
				class="block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
				bind:value={inverterCount}
				onchange={applyConfig}
			/>
		</div>

		<div>
			<label for="defaultStrings" class="mb-1 block text-sm font-medium"
				>מספר מחרוזות ברירת מחדל</label
			>
			<input
				id="defaultStrings"
				type="number"
				min="1"
				max="26"
				class="block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
				bind:value={defaultStrings}
				onchange={applyConfig}
			/>
		</div>
	</div>

	{#if store.inspection.inverterConfigs.length > 0}
		<div class="space-y-3">
			<h3 class="text-lg font-semibold">ממירים</h3>
			{#each store.inspection.inverterConfigs as config (config.index)}
				<div
					class="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
				>
					<div class="flex-1">
						<label for="inv-label-{config.index}" class="mb-1 block text-xs text-gray-500"
							>שם ממיר</label
						>
						<input
							id="inv-label-{config.index}"
							type="text"
							class="block w-full rounded border-gray-300 text-sm shadow-sm"
							value={config.label}
							oninput={(e) =>
								store.updateInverterConfig(config.index, { label: e.currentTarget.value })}
						/>
					</div>
					<div class="w-28">
						<label for="inv-strings-{config.index}" class="mb-1 block text-xs text-gray-500"
							>מחרוזות</label
						>
						<input
							id="inv-strings-{config.index}"
							type="number"
							min="1"
							max="26"
							class="block w-full rounded border-gray-300 text-sm shadow-sm"
							value={config.stringCount}
							onchange={(e) =>
								store.updateInverterConfig(config.index, {
									stringCount: parseInt(e.currentTarget.value) || 1
								})}
						/>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
