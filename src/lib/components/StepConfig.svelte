<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { haptic } from '$lib/utils/haptics.js';
	import type { createInspectionStore } from '$lib/stores/inspection.svelte.js';

	let { store }: { store: ReturnType<typeof createInspectionStore> } = $props();

	let inverterCount = $state(store.inspection.inverterConfigs.length || 3);
	let defaultStrings = $state(9);

	function applyConfig() {
		haptic('medium');
		store.setInverterConfigs(inverterCount, defaultStrings);
	}

	$effect(() => {
		if (store.inspection.inverterConfigs.length === 0) {
			applyConfig();
		}
	});
</script>

<div class="space-y-4">
	<div class="space-y-1">
		<h2 class="text-lg font-bold text-white">הגדרת מערכת</h2>
		<p class="text-sm text-gray-400">הגדר את מספר הממירים והמחרוזות באתר</p>
	</div>

	<div class="grid grid-cols-2 gap-4">
		<div>
			<label for="inverterCount" class="mb-1.5 block text-sm font-medium text-gray-300"
				>מספר ממירים</label
			>
			<input
				id="inverterCount"
				type="number"
				min="1"
				max="50"
				class="block w-full px-3 py-2"
				bind:value={inverterCount}
				onchange={applyConfig}
			/>
		</div>
		<div>
			<label for="defaultStrings" class="mb-1.5 block text-sm font-medium text-gray-300"
				>מחרוזות לממיר</label
			>
			<input
				id="defaultStrings"
				type="number"
				min="1"
				max="26"
				class="block w-full px-3 py-2"
				bind:value={defaultStrings}
				onchange={applyConfig}
			/>
		</div>
	</div>

	{#if store.inspection.inverterConfigs.length > 0}
		<div class="space-y-2">
			{#each store.inspection.inverterConfigs as config (config.index)}
				<div
					class="flex items-center gap-3 rounded-xl border border-border bg-surface-800 p-3"
					in:fly={{ y: 10, duration: 350, easing: cubicOut }}
				>
					<div
						class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-accent-dim text-sm font-bold text-accent"
					>
						{config.index}
					</div>
					<div class="flex-1">
						<input
							type="text"
							class="block w-full rounded-lg border-none bg-surface-700 px-2.5 py-1.5 text-sm"
							value={config.label}
							oninput={(e) =>
								store.updateInverterConfig(config.index, { label: e.currentTarget.value })}
						/>
					</div>
					<div class="flex items-center gap-1.5">
						<span class="text-xs text-gray-500">מחר׳</span>
						<input
							type="number"
							min="1"
							max="26"
							class="w-16 rounded-lg border-none bg-surface-700 px-2 py-1.5 text-center text-sm"
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