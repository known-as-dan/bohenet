import { createChecklistFromTemplate, checklistSections } from '../config/checklist.js';
import { createAcMeasurementsFromTemplate } from '../config/ac.js';
import type {
	InspectionMeta,
	InverterConfig,
	DcStringMeasurement,
	Defect
} from '../models/inspection.js';
import type { SavedReport } from './reports.js';
import { saveReport } from './reports.js';

/** Map a checklist sectionCode like "1.5" to its parent section title */
function getSectionTitle(sectionCode: string): string {
	const parentCode = sectionCode.split('.')[0];
	return checklistSections.find((s) => s.code === parentCode)?.title ?? '';
}

/** Shorten a verbose checklist description into a compact fault label */
function shortenFault(desc: string): string {
	// Strip leading imperative verbs
	let s = desc
		.replace(/^(ודא|בדוק|בצע|ציין|חזק|מדוד)\s+(את\s+|כי\s+|על\s+)?/i, '')
		.replace(/^(המצאות ו)/, '');
	// Take only the first sentence/clause
	s = s.split(/[.;]/, 1)[0].split(' - ', 1)[0];
	// Trim and cap length
	s = s.trim();
	if (s.length > 60) s = s.slice(0, 57) + '...';
	// Capitalize first char (for Hebrew it's a no-op but just in case)
	return s;
}

const INSPECTOR_KEY = 'bohenet_inspector';
const STRING_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function saveInspectorName(name: string) {
	try {
		localStorage.setItem(INSPECTOR_KEY, name);
	} catch {
		/* ignore */
	}
}

function generateDcMeasurements(configs: InverterConfig[]): DcStringMeasurement[] {
	return configs.flatMap((inv) =>
		Array.from({ length: inv.stringCount }, (_, i) => ({
			inverterIndex: inv.index,
			stringLabel: STRING_LABELS[i] || `S${i + 1}`,
			panelCount: undefined,
			openCircuitVoltage: undefined,
			operatingCurrent: undefined,
			stringRiso: undefined,
			feedRisoNegative: undefined,
			feedRisoPositive: undefined
		}))
	);
}

function generateInverterSerials(configs: InverterConfig[]) {
	return configs.map((inv) => ({
		inverterIndex: inv.index,
		serialNumber: ''
	}));
}

export function createInspectionStore(report: SavedReport) {
	let currentReport = $state<SavedReport>(report);

	// Initialize checklist/AC if empty (new report), or sync with template
	if (currentReport.inspection.checklist.length === 0) {
		currentReport.inspection.checklist = createChecklistFromTemplate();
	} else {
		// Ensure any new template items are added to existing reports
		const template = createChecklistFromTemplate();
		const existing = new Set(currentReport.inspection.checklist.map((c) => c.sectionCode));
		for (const item of template) {
			if (!existing.has(item.sectionCode)) {
				currentReport.inspection.checklist.push(item);
			}
		}
	}
	if (currentReport.inspection.acMeasurements.length === 0) {
		currentReport.inspection.acMeasurements = createAcMeasurementsFromTemplate();
	} else {
		const template = createAcMeasurementsFromTemplate();
		const existing = new Set(currentReport.inspection.acMeasurements.map((a) => a.itemCode));
		for (const item of template) {
			if (!existing.has(item.itemCode)) {
				currentReport.inspection.acMeasurements.push(item);
			}
		}
	}

	let currentStep = $state(0);

	const steps = [
		'פרטי בדיקה',
		'הגדרת מערכת',
		'בדיקות חזותיות',
		'מדידות DC',
		'מדידות AC',
		'ליקויים',
		'סיכום וייצוא'
	];

	function save() {
		saveReport(currentReport);
		if (currentReport.inspection.meta.inspectorName) {
			saveInspectorName(currentReport.inspection.meta.inspectorName);
		}
	}

	function updateReportName(name: string) {
		currentReport.name = name;
		save();
	}

	function updateMeta(meta: Partial<InspectionMeta>) {
		currentReport.inspection.meta = { ...currentReport.inspection.meta, ...meta };
		if (meta.siteName && (currentReport.name === 'בדיקה חדשה' || !currentReport.name)) {
			currentReport.name = meta.siteName;
		}
		save();
	}

	function setInverterConfigs(count: number, defaultStrings = 9) {
		const existing = currentReport.inspection.inverterConfigs;
		const configs: InverterConfig[] = Array.from({ length: count }, (_, i) => ({
			index: i + 1,
			label: existing[i]?.label ?? `ממיר ${i + 1}`,
			stringCount: existing[i]?.stringCount ?? defaultStrings
		}));
		currentReport.inspection.inverterConfigs = configs;
		currentReport.inspection.dcMeasurements = generateDcMeasurements(configs);
		currentReport.inspection.inverterSerials = generateInverterSerials(configs);
		save();
	}

	function updateInverterConfig(index: number, updates: Partial<InverterConfig>) {
		const config = currentReport.inspection.inverterConfigs.find((c) => c.index === index);
		if (config) {
			Object.assign(config, updates);
			currentReport.inspection.dcMeasurements = generateDcMeasurements(
				currentReport.inspection.inverterConfigs
			);
			currentReport.inspection.inverterSerials = generateInverterSerials(
				currentReport.inspection.inverterConfigs
			);
			save();
		}
	}

	function updateChecklistItem(sectionCode: string, status?: string, notes?: string) {
		const item = currentReport.inspection.checklist.find((c) => c.sectionCode === sectionCode);
		if (item) {
			if (status !== undefined) item.status = status as typeof item.status;
			if (notes !== undefined) item.notes = notes;
			save();
		}
	}

	function markSectionAllOk(sectionCode: string) {
		currentReport.inspection.checklist
			.filter((c) => c.sectionCode.startsWith(sectionCode + '.'))
			.forEach((c) => {
				if (!c.status) c.status = 'תקין';
			});
		save();
	}

	function updateDcMeasurement(
		inverterIndex: number,
		stringLabel: string,
		updates: Partial<DcStringMeasurement>
	) {
		const m = currentReport.inspection.dcMeasurements.find(
			(d) => d.inverterIndex === inverterIndex && d.stringLabel === stringLabel
		);
		if (m) {
			Object.assign(m, updates);
			save();
		}
	}

	function updateAcMeasurement(itemCode: string, result?: string | number, notes?: string) {
		const m = currentReport.inspection.acMeasurements.find((a) => a.itemCode === itemCode);
		if (m) {
			if (result !== undefined) m.result = result;
			if (notes !== undefined) m.notes = notes;
			save();
		}
	}

	function updateInverterSerial(inverterIndex: number, serialNumber: string) {
		const s = currentReport.inspection.inverterSerials.find(
			(i) => i.inverterIndex === inverterIndex
		);
		if (s) {
			s.serialNumber = serialNumber;
			save();
		}
	}

	function addDefect(defect?: Partial<Defect>) {
		currentReport.inspection.defects.push({
			component: defect?.component ?? '',
			fault: defect?.fault ?? '',
			location: defect?.location ?? '',
			status: defect?.status ?? ''
		});
		save();
	}

	function removeDefect(index: number) {
		currentReport.inspection.defects.splice(index, 1);
		save();
	}

	function duplicateDefect(index: number) {
		const d = currentReport.inspection.defects[index];
		if (d) {
			currentReport.inspection.defects.splice(index + 1, 0, { ...d });
			save();
		}
	}

	function goToStep(step: number) {
		if (step >= 0 && step < steps.length) {
			currentStep = step;
		}
	}

	function nextStep() {
		goToStep(currentStep + 1);
	}

	function prevStep() {
		goToStep(currentStep - 1);
	}

	let autoDefects = $derived(
		currentReport.inspection.checklist
			.filter((c) => c.status === 'לא תקין')
			.map((c) => ({
				sectionCode: c.sectionCode,
				component: getSectionTitle(c.sectionCode),
				fault: shortenFault(c.description),
				location: `סעיף ${c.sectionCode}`,
				status: c.notes || ''
			}))
	);

	let allDefects = $derived([
		...autoDefects,
		...currentReport.inspection.defects
	]);

	return {
		get inspection() {
			return currentReport.inspection;
		},
		get report() {
			return currentReport;
		},
		get currentStep() {
			return currentStep;
		},
		get steps() {
			return steps;
		},
		get autoDefects() {
			return autoDefects;
		},
		get allDefects() {
			return allDefects;
		},
		save,
		updateReportName,
		updateMeta,
		setInverterConfigs,
		updateInverterConfig,
		updateChecklistItem,
		markSectionAllOk,
		updateDcMeasurement,
		updateAcMeasurement,
		updateInverterSerial,
		addDefect,
		removeDefect,
		duplicateDefect,
		goToStep,
		nextStep,
		prevStep
	};
}
