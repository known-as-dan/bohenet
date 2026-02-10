import * as XLSX from 'xlsx';
import type { Inspection } from '../models/inspection.js';
import { checklistSections } from '../config/checklist.js';
import { acSections } from '../config/ac.js';

function buildChecklistSheet(inspection: Inspection): XLSX.WorkSheet {
	const rows: (string | number | undefined)[][] = [];

	// Header rows
	rows.push(['שם אתר:', inspection.meta.siteName, 'תאריך בדיקה:', inspection.meta.inspectionDate]);
	rows.push([
		'שם בודק:',
		inspection.meta.inspectorName,
		'חתימה:',
		inspection.meta.signatureText || ''
	]);
	rows.push(['סעיף', 'תיאור הבדיקה', 'אישור תקינות', 'הערות']);

	// Sections
	for (const section of checklistSections) {
		rows.push([section.code, section.title, '', '']);
		for (const item of section.items) {
			const filled = inspection.checklist.find((c) => c.sectionCode === item.sectionCode);
			rows.push([
				item.sectionCode,
				item.description,
				filled?.status ?? '',
				filled?.notes ?? ''
			]);
		}
	}

	const ws = XLSX.utils.aoa_to_sheet(rows);

	// Set column widths
	ws['!cols'] = [{ wch: 8 }, { wch: 50 }, { wch: 14 }, { wch: 30 }];

	return ws;
}

function buildDcSheet(inspection: Inspection): XLSX.WorkSheet {
	const rows: (string | number | undefined)[][] = [];

	rows.push([
		'ממיר',
		'מחרוזת',
		'כמות קולטים',
		'מתח ריקם (V)',
		'זרם עבודה (A)',
		'בידוד מחרוזת Riso (MΩ)',
		'בידוד הזנה Riso - (MΩ)',
		'בידוד הזנה Riso + (MΩ)'
	]);

	for (const m of inspection.dcMeasurements) {
		rows.push([
			m.inverterIndex,
			m.stringLabel,
			m.panelCount,
			m.openCircuitVoltage,
			m.operatingCurrent,
			m.stringRiso,
			m.feedRisoNegative,
			m.feedRisoPositive
		]);
	}

	const ws = XLSX.utils.aoa_to_sheet(rows);
	ws['!cols'] = [
		{ wch: 8 },
		{ wch: 10 },
		{ wch: 12 },
		{ wch: 14 },
		{ wch: 14 },
		{ wch: 22 },
		{ wch: 22 },
		{ wch: 22 }
	];

	return ws;
}

function buildAcSheet(inspection: Inspection): XLSX.WorkSheet {
	const rows: (string | number | undefined)[][] = [];

	rows.push(['סעיף', 'תיאור הבדיקה', 'תוצאה', 'הערות']);

	for (const section of acSections) {
		rows.push([section.code, section.title, '', '']);
		for (const item of section.items) {
			const filled = inspection.acMeasurements.find((a) => a.itemCode === item.itemCode);
			rows.push([
				item.itemCode,
				item.description,
				filled?.result ?? '',
				filled?.notes ?? ''
			]);
		}
	}

	// Inverter serials section
	if (inspection.inverterSerials.length > 0) {
		rows.push(['6', 'מספרים סידוריים - מהפכים', '', '']);
		for (const serial of inspection.inverterSerials) {
			rows.push([
				`6.${serial.inverterIndex}`,
				`מהפך ${serial.inverterIndex}`,
				serial.serialNumber,
				''
			]);
		}
	}

	const ws = XLSX.utils.aoa_to_sheet(rows);
	ws['!cols'] = [{ wch: 8 }, { wch: 30 }, { wch: 20 }, { wch: 30 }];

	return ws;
}

function buildDefectsSheet(inspection: Inspection): XLSX.WorkSheet {
	const rows: (string | undefined)[][] = [];

	rows.push(['רכיב', 'תקלה', 'מיקום במערכת', 'סטטוס']);

	for (const d of inspection.defects) {
		rows.push([d.component, d.fault, d.location, d.status]);
	}

	const ws = XLSX.utils.aoa_to_sheet(rows);
	ws['!cols'] = [{ wch: 14 }, { wch: 40 }, { wch: 20 }, { wch: 30 }];

	return ws;
}

export function inspectionToWorkbook(inspection: Inspection): XLSX.WorkBook {
	const wb = XLSX.utils.book_new();

	XLSX.utils.book_append_sheet(wb, buildChecklistSheet(inspection), 'פרוטוקול בדיקה תקופתית');
	XLSX.utils.book_append_sheet(wb, buildDcSheet(inspection), 'ערכי DC');
	XLSX.utils.book_append_sheet(wb, buildAcSheet(inspection), 'ערכי AC');
	XLSX.utils.book_append_sheet(wb, buildDefectsSheet(inspection), 'ריכוז ליקויים');

	return wb;
}

export function downloadWorkbook(inspection: Inspection) {
	const wb = inspectionToWorkbook(inspection);
	const filename = `בדיקה_${inspection.meta.siteName || 'ללא_שם'}_${inspection.meta.inspectionDate}.xlsx`;
	XLSX.writeFile(wb, filename);
}
