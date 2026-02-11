<script lang="ts">
	import { fly, slide, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { haptic } from '$lib/utils/haptics.js';
	import { browser } from '$app/environment';
	import {
		listReports,
		loadReport,
		saveReport,
		createNewReport,
		deleteReport,
		duplicateReport,
		loadFolders,
		saveFolders,
		migrateOldData,
		type ReportSummary,
		type SavedReport
	} from '$lib/stores/reports.js';
	let { onopen }: { onopen: (report: SavedReport) => void } = $props();

	// Migrate old data on first run
	if (browser) {
		migrateOldData();
	}

	let reports = $state<ReportSummary[]>(listReports());
	let folders = $state<string[]>(loadFolders());
	let activeFolder = $state<string | null>(null);
	let showNewFolder = $state(false);
	let newFolderName = $state('');

	function refresh() {
		reports = listReports();
		folders = loadFolders();
	}

	let filteredReports = $derived(
		activeFolder ? reports.filter((r) => r.folder === activeFolder) : reports
	);

	function handleNew() {
		haptic('medium');
		const report = createNewReport(activeFolder || 'כללי');
		onopen(report);
	}

	function handleOpen(id: string) {
		haptic('light');
		const report = loadReport(id);
		if (report) onopen(report);
	}

	function handleDelete(id: string) {
		if (confirm('למחוק דוח זה לצמיתות?')) {
			haptic('warning');
			deleteReport(id);
			refresh();
		}
	}

	function handleDuplicate(id: string) {
		haptic('light');
		duplicateReport(id);
		refresh();
	}

	function handleAddFolder() {
		const name = newFolderName.trim();
		if (name && !folders.includes(name)) {
			haptic('light');
			folders = [...folders, name];
			saveFolders(folders);
			newFolderName = '';
			showNewFolder = false;
		}
	}

	function handleDeleteFolder(folder: string) {
		const folderReports = reports.filter((r) => r.folder === folder);
		if (folderReports.length > 0) {
			if (!confirm(`תיקייה "${folder}" מכילה ${folderReports.length} דוחות. הדוחות יועברו לתיקיית \"כללי\". להמשיך?`)) return;
			for (const r of folderReports) {
				const full = loadReport(r.id);
				if (full) {
					full.folder = 'כללי';
					saveReport(full);
				}
			}
		} else {
			if (!confirm(`למחוק את תיקיית "${folder}"?`)) return;
		}
		folders = folders.filter((f) => f !== folder);
		saveFolders(folders);
		if (activeFolder === folder) activeFolder = null;
		refresh();
	}

	function formatDate(iso: string): string {
		try {
			return new Date(iso).toLocaleDateString('he-IL', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return iso;
		}
	}

	// Unique folders from reports that might not be in the folders list
	let allFolders = $derived([...new Set([...folders, ...reports.map((r) => r.folder)])]);
</script>

<div class="mx-auto max-w-lg px-4 py-6">
	<!-- Header -->
	<div class="mb-8 flex flex-col items-center">
		<img src="/logo.svg" alt="בוחנת" class="mb-3 h-28 w-28" />
		<h1 class="mb-0.5 text-2xl font-bold text-white">בוחנת</h1>
		<p class="text-sm text-gray-500">בדיקות תקופתיות PV</p>
	</div>

	<!-- New Report Button -->
	<button
		type="button"
		class="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-base font-semibold text-white shadow-md shadow-accent/15 transition-all hover:bg-accent-hover active:scale-[0.98]"
		onclick={handleNew}
	>
		<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
			<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
		</svg>
		בדיקה חדשה
	</button>

	<!-- Folders -->
	<div class="mb-4">
		<div class="mb-2 flex flex-wrap gap-1.5">
			<button
				type="button"
				class="rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors {activeFolder === null ? 'bg-accent text-white' : 'bg-surface-800 text-gray-400 active:bg-surface-700'}"
				onclick={() => (activeFolder = null)}
			>
				הכל ({reports.length})
			</button>
			{#each allFolders as folder}
				{@const count = reports.filter((r) => r.folder === folder).length}
				{@const isActive = activeFolder === folder}
				{@const isDefault = folder === 'כללי'}
				<button
					type="button"
					class="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors {isActive ? 'bg-accent text-white' : 'bg-surface-800 text-gray-400 active:bg-surface-700'}"
					onclick={() => (activeFolder = isActive ? null : folder)}
				>
					<svg class="h-3.5 w-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
					</svg>
					{folder} ({count})
					{#if isActive && !isDefault}
						<span
							role="button"
							tabindex="0"
							class="-me-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white/60 transition-colors hover:bg-white/20 hover:text-white"
							title="מחק תיקייה"
							onclick={(e) => { e.stopPropagation(); handleDeleteFolder(folder); }}
							onkeydown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); handleDeleteFolder(folder); } }}
						>
							&times;
						</span>
					{/if}
				</button>
			{/each}
			<button
				type="button"
				class="rounded-lg bg-surface-800 px-3.5 py-1.5 text-sm text-gray-500 active:bg-surface-700"
				onclick={() => (showNewFolder = !showNewFolder)}
			>
				+ תיקייה
			</button>
		</div>

		{#if showNewFolder}
			<div class="flex gap-2" transition:slide={{ duration: 300, easing: cubicOut }}>
				<input
					type="text"
					class="flex-1 rounded-lg border-border bg-surface-700 px-3 py-2 text-sm"
					placeholder="שם תיקייה..."
					bind:value={newFolderName}
					onkeydown={(e) => e.key === 'Enter' && handleAddFolder()}
				/>
				<button
					type="button"
					class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white active:bg-accent/80"
					onclick={handleAddFolder}
				>
					צור
				</button>
			</div>
		{/if}
	</div>

	<!-- Reports List -->
	{#if filteredReports.length === 0}
		<div class="py-16 text-center" in:fade={{ duration: 400 }}>
			<img src="/logo.svg" alt="" class="mx-auto mb-4 h-20 w-20 opacity-20" />
			<p class="text-gray-400">
				{activeFolder ? 'אין דוחות בתיקייה זו' : 'אין דוחות עדיין'}
			</p>
			<p class="mt-1 text-sm text-gray-500">לחץ "בדיקה חדשה" להתחיל</p>
		</div>
	{:else}
		<div class="space-y-2.5">
			{#each filteredReports as report, i (report.id)}
				<div
					class="cursor-pointer rounded-xl border border-border/60 bg-surface-800 p-3.5 transition-all active:border-border-light active:bg-surface-700"
					in:fly|global={{ y: 12, duration: 350, delay: Math.min(i * 50, 250), easing: cubicOut }}
					role="button"
					tabindex="0"
					onclick={() => handleOpen(report.id)}
					onkeydown={(e) => e.key === 'Enter' && handleOpen(report.id)}
				>
					<div class="mb-1.5 flex items-start justify-between">
						<div class="min-w-0 flex-1">
							<h3 class="truncate text-[15px] font-semibold text-white">{report.name}</h3>
							<p class="text-sm text-gray-500">
								{report.siteName || 'ללא שם אתר'} &middot; {report.inspectionDate}
							</p>
						</div>
						<div class="flex gap-0.5">
							<button
								type="button"
								class="rounded-lg p-1.5 text-gray-500 transition-colors active:bg-surface-600 active:text-gray-300"
								title="שכפל"
								onclick={(e) => { e.stopPropagation(); handleDuplicate(report.id); }}
							>
								<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
								</svg>
							</button>
							<button
								type="button"
								class="rounded-lg p-1.5 text-gray-500 transition-colors active:bg-danger-dim active:text-danger"
								title="מחק"
								onclick={(e) => { e.stopPropagation(); handleDelete(report.id); }}
							>
								<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
							</button>
						</div>
					</div>
					<div class="flex items-center justify-between text-xs text-gray-500">
						<span class="flex items-center gap-1">
							<svg class="h-3 w-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
							</svg>
							{report.folder}
						</span>
						<span>עודכן {formatDate(report.updatedAt)}</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
