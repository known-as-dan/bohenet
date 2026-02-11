<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { haptic } from '$lib/utils/haptics.js';
	import type { createInspectionStore } from '$lib/stores/inspection.svelte.js';

	let { store }: { store: ReturnType<typeof createInspectionStore> } = $props();

	let inverterCount = $state(store.inspection.inverterConfigs.length);

	function applyConfig() {
		haptic('medium');
		store.setInverterConfigs(inverterCount);
	}
</script>

<div class="space-y-4">
	<div class="space-y-1">
		<h2 class="text-lg lg:text-xl font-bold text-white">הגדרת מערכת</h2>
		<p class="text-sm lg:text-base text-gray-400">הגדר את מספר הממירים באתר</p>
	</div>

	<div>
		<label for="inverterCount" class="mb-1.5 block text-sm lg:text-base font-medium text-gray-300"
			>מספר ממירים</label
		>
		<input
			id="inverterCount"
			type="number"
			min="1"
			max="50"
			class="block w-full lg:max-w-xs px-3 py-2"
			bind:value={inverterCount}
			onchange={applyConfig}
		/>
	</div>

	{#if store.inspection.inverterConfigs.length > 0}
		<div class="space-y-2 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
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
					</div>
			{/each}
		</div>
	{/if}
</div>