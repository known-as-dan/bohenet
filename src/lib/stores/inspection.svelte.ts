import { createChecklistFromTemplate } from '../config/checklist.js';
import { createAcMeasurementsFromTemplate } from '../config/ac.js';
import type {
	Inspection,
	InspectionMeta,
	InverterConfig,
	DcStringMeasurement,
	InverterSerial,
	Defect
} from '../models/inspection.js';
import { createDefaultMeta } from '../models/inspection.js';

const STORAGE_KEY = 'bohenet_inspection';
const INSPECTOR_KEY = 'bohenet_inspector';
const STRING_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function loadFromStorage(): Inspection | null {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) return JSON.parse(raw);
	} catch {
		/* ignore */
	}
	return null;
}

function saveToStorage(inspection: Inspection) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(inspection));
	} catch {
		/* ignore */
	}
}

function loadInspectorName(): string {
	try {
		return localStorage.getItem(INSPECTOR_KEY) ?? '';
	} catch {
		return '';
	}
}

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

function generateInverterSerials(configs: InverterConfig[]): InverterSerial[] {
	return configs.map((inv) => ({
		inverterIndex: inv.index,
		serialNumber: ''
	}));
}

export function createInspectionStore() {
	const saved = loadFromStorage();

	let inspection = $state<Inspection>(
		saved ?? {
			meta: {
				...createDefaultMeta(),
				inspectorName: loadInspectorName()
			},
			inverterConfigs: [],
			checklist: createChecklistFromTemplate(),
			dcMeasurements: [],
			acMeasurements: createAcMeasurementsFromTemplate(),
			inverterSerials: [],
			defects: []
		}
	);

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
		saveToStorage(inspection);
		if (inspection.meta.inspectorName) {
			saveInspectorName(inspection.meta.inspectorName);
		}
	}

	function updateMeta(meta: Partial<InspectionMeta>) {
		inspection.meta = { ...inspection.meta, ...meta };
		save();
	}

	function setInverterConfigs(count: number, defaultStrings = 9) {
		const existing = inspection.inverterConfigs;
		const configs: InverterConfig[] = Array.from({ length: count }, (_, i) => ({
			index: i + 1,
			label: existing[i]?.label ?? `ממיר ${i + 1}`,
			stringCount: existing[i]?.stringCount ?? defaultStrings
		}));
		inspection.inverterConfigs = configs;
		inspection.dcMeasurements = generateDcMeasurements(configs);
		inspection.inverterSerials = generateInverterSerials(configs);
		save();
	}

	function updateInverterConfig(index: number, updates: Partial<InverterConfig>) {
		const config = inspection.inverterConfigs.find((c) => c.index === index);
		if (config) {
			Object.assign(config, updates);
			inspection.dcMeasurements = generateDcMeasurements(inspection.inverterConfigs);
			inspection.inverterSerials = generateInverterSerials(inspection.inverterConfigs);
			save();
		}
	}

	function updateChecklistItem(sectionCode: string, status?: string, notes?: string) {
		const item = inspection.checklist.find((c) => c.sectionCode === sectionCode);
		if (item) {
			if (status !== undefined) item.status = status as typeof item.status;
			if (notes !== undefined) item.notes = notes;
			save();
		}
	}

	function markSectionAllOk(sectionCode: string) {
		inspection.checklist
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
		const m = inspection.dcMeasurements.find(
			(d) => d.inverterIndex === inverterIndex && d.stringLabel === stringLabel
		);
		if (m) {
			Object.assign(m, updates);
			save();
		}
	}

	function updateAcMeasurement(itemCode: string, result?: string | number, notes?: string) {
		const m = inspection.acMeasurements.find((a) => a.itemCode === itemCode);
		if (m) {
			if (result !== undefined) m.result = result;
			if (notes !== undefined) m.notes = notes;
			save();
		}
	}

	function updateInverterSerial(inverterIndex: number, serialNumber: string) {
		const s = inspection.inverterSerials.find((i) => i.inverterIndex === inverterIndex);
		if (s) {
			s.serialNumber = serialNumber;
			save();
		}
	}

	function addDefect(defect?: Partial<Defect>) {
		inspection.defects.push({
			component: defect?.component ?? '',
			fault: defect?.fault ?? '',
			location: defect?.location ?? '',
			status: defect?.status ?? ''
		});
		save();
	}

	function removeDefect(index: number) {
		inspection.defects.splice(index, 1);
		save();
	}

	function duplicateDefect(index: number) {
		const d = inspection.defects[index];
		if (d) {
			inspection.defects.splice(index + 1, 0, { ...d });
			save();
		}
	}

	function resetInspection() {
		inspection = {
			meta: {
				...createDefaultMeta(),
				inspectorName: loadInspectorName()
			},
			inverterConfigs: [],
			checklist: createChecklistFromTemplate(),
			dcMeasurements: [],
			acMeasurements: createAcMeasurementsFromTemplate(),
			inverterSerials: [],
			defects: []
		};
		currentStep = 0;
		save();
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

	return {
		get inspection() {
			return inspection;
		},
		get currentStep() {
			return currentStep;
		},
		get steps() {
			return steps;
		},
		save,
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
		resetInspection,
		goToStep,
		nextStep,
		prevStep
	};
}
