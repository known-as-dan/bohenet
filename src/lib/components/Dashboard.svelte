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
	<div class="mb-8 text-center">
		<div class="mb-2 text-4xl">⚡</div>
		<h1 class="mb-1 text-2xl font-bold text-white">בוחנת</h1>
		<p class="text-sm text-surface-400">בדיקות תקופתיות PV</p>
	</div>

	<!-- New Report Button -->
	<button
		type="button"
		class="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover hover:shadow-accent/30 active:scale-[0.98]"
		onclick={handleNew}
	>
		<span class="text-xl">+</span>
		בדיקה חדשה
	</button>

	<!-- Folders -->
	<div class="mb-4">
		<div class="mb-2 flex flex-wrap gap-2">
			<button
				type="button"
				class="rounded-xl px-4 py-2 text-sm font-medium transition-colors {activeFolder === null ? 'bg-accent text-white' : 'bg-surface-700 text-gray-300 active:bg-surface-600'}"
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
					class="flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors {isActive ? 'bg-accent text-white' : 'bg-surface-700 text-gray-300 active:bg-surface-600'}"
					onclick={() => (activeFolder = isActive ? null : folder)}
				>
					📁 {folder} ({count})
					{#if isActive && !isDefault}
						<span
							role="button"
							tabindex="0"
							class="me-1 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white/70 transition-colors hover:bg-white/20 hover:text-white"
							title="מחק תיקייה"
							onclick={(e) => { e.stopPropagation(); handleDeleteFolder(folder); }}
							onkeydown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); handleDeleteFolder(folder); } }}
						>
							×
						</span>
					{/if}
				</button>
			{/each}
			<button
				type="button"
				class="rounded-xl bg-surface-700 px-4 py-2 text-sm text-gray-400 active:bg-surface-600"
				onclick={() => (showNewFolder = !showNewFolder)}
			>
				+ תיקייה
			</button>
		</div>

		{#if showNewFolder}
			<div class="flex gap-2" transition:slide={{ duration: 300, easing: cubicOut }}>
				<input
					type="text"
					class="flex-1 rounded-xl border-border bg-surface-700 px-3 py-2.5 text-sm"
					placeholder="שם תיקייה..."
					bind:value={newFolderName}
					onkeydown={(e) => e.key === 'Enter' && handleAddFolder()}
				/>
				<button
					type="button"
					class="rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white active:bg-accent/80"
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
			<div class="mb-3 text-5xl opacity-30">📋</div>
			<p class="text-gray-400">
				{activeFolder ? 'אין דוחות בתיקייה זו' : 'אין דוחות עדיין'}
			</p>
			<p class="mt-1 text-sm text-gray-500">לחץ "בדיקה חדשה" להתחיל</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each filteredReports as report, i (report.id)}
				<div
					class="cursor-pointer rounded-xl border border-border bg-surface-800 p-4 transition-all active:border-border-light active:bg-surface-700"
					in:fly|global={{ y: 15, duration: 400, delay: Math.min(i * 60, 300), easing: cubicOut }}
					role="button"
					tabindex="0"
					onclick={() => handleOpen(report.id)}
					onkeydown={(e) => e.key === 'Enter' && handleOpen(report.id)}
				>
					<div class="mb-2 flex items-start justify-between">
						<div class="min-w-0 flex-1">
							<h3 class="truncate font-semibold text-white">{report.name}</h3>
							<p class="text-sm text-gray-400">
								{report.siteName || 'ללא שם אתר'} · {report.inspectionDate}
							</p>
						</div>
						<div class="flex gap-1">
							<button
								type="button"
								class="rounded-xl p-2 text-gray-400 active:bg-surface-600 active:text-white"
								title="שכפל"
								onclick={(e) => { e.stopPropagation(); handleDuplicate(report.id); }}
							>
								📄
							</button>
							<button
								type="button"
								class="rounded-xl p-2 text-gray-400 active:bg-danger-dim active:text-danger"
								title="מחק"
								onclick={(e) => { e.stopPropagation(); handleDelete(report.id); }}
							>
								🗑️
							</button>
						</div>
					</div>
					<div class="flex items-center justify-between text-xs text-gray-500">
						<span>📁 {report.folder}</span>
						<span>עודכן {formatDate(report.updatedAt)}</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
