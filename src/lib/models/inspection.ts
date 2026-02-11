export type ChecklistStatus = 'תקין' | 'לא תקין' | 'ל.ק.' | '*' | 'ללא';

export type InspectionMeta = {
	siteName: string;
	inspectionDate: string; // ISO date
	inspectorName: string;
	signatureText?: string;
};

export type ChecklistItem = {
	sectionCode: string;
	description: string;
	status?: ChecklistStatus;
	notes?: string;
};

export type DcStringMeasurement = {
	id: string;
	parentId: string | null;
	inverterIndex: number;
	stringLabel: string;
	panelCount?: number;
	openCircuitVoltage?: number;
	operatingCurrent?: number;
	stringRiso?: number;
	feedRisoNegative?: number;
	feedRisoPositive?: number;
};

export type AcMeasurement = {
	itemCode: string;
	description: string;
	result?: string | number;
	notes?: string;
};

export type InverterSerial = {
	inverterIndex: number;
	serialNumber: string;
};

export type Defect = {
	component: string;
	fault: string;
	location: string;
	status: string;
};

export type InverterConfig = {
	index: number;
	label: string;
	stringCount: number;
};

export type Inspection = {
	meta: InspectionMeta;
	inverterConfigs: InverterConfig[];
	checklist: ChecklistItem[];
	dcMeasurements: DcStringMeasurement[];
	acMeasurements: AcMeasurement[];
	inverterSerials: InverterSerial[];
	defects: Defect[];
};

export function createDefaultMeta(): InspectionMeta {
	return {
		siteName: '',
		inspectionDate: new Date().toISOString().split('T')[0],
		inspectorName: '',
		signatureText: ''
	};
}

export function createDefaultInspection(): Inspection {
	return {
		meta: createDefaultMeta(),
		inverterConfigs: [],
		checklist: [],
		dcMeasurements: [],
		acMeasurements: [],
		inverterSerials: [],
		defects: []
	};
}
