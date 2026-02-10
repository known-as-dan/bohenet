import type { AcMeasurement } from '../models/inspection.js';

export type AcSection = {
	code: string;
	title: string;
	items: { itemCode: string; description: string }[];
};

export const acSections: AcSection[] = [
	{
		code: '1',
		title: 'הגדרות מפסק ראשי',
		items: [
			{ itemCode: '1.1', description: 'I1 (A)' },
			{ itemCode: '1.2', description: 'I3 (A)' },
			{ itemCode: '1.3', description: 'iΔ (A)' },
			{ itemCode: '1.4', description: 'tΔ (ms)' }
		]
	},
	{
		code: '2',
		title: 'הגדרות לוח מאסף',
		items: [
			{ itemCode: '2.1', description: 'I1 (A)' },
			{ itemCode: '2.2', description: 'I3 (A)' },
			{ itemCode: '2.3', description: 'iΔ (A)' },
			{ itemCode: '2.4', description: 'tΔ (ms)' }
		]
	},
	{
		code: '3',
		title: 'עכבת לולאה (L.T)',
		items: [
			{ itemCode: '3.1', description: 'L1-N (Ω)' },
			{ itemCode: '3.2', description: 'L2-N (Ω)' },
			{ itemCode: '3.3', description: 'L3-N (Ω)' },
			{ itemCode: '3.4', description: 'L1-PE (Ω)' },
			{ itemCode: '3.5', description: 'L2-PE (Ω)' },
			{ itemCode: '3.6', description: 'L3-PE (Ω)' }
		]
	},
	{
		code: '4',
		title: 'מתח רשת לפני סנכרון',
		items: [
			{ itemCode: '4.1', description: 'L1-N (V)' },
			{ itemCode: '4.2', description: 'L2-N (V)' },
			{ itemCode: '4.3', description: 'L3-N (V)' },
			{ itemCode: '4.4', description: 'L1-L2 (V)' },
			{ itemCode: '4.5', description: 'L2-L3 (V)' },
			{ itemCode: '4.6', description: 'L3-L1 (V)' }
		]
	},
	{
		code: '5',
		title: 'מתח רשת אחרי סנכרון',
		items: [
			{ itemCode: '5.1', description: 'L1-N (V)' },
			{ itemCode: '5.2', description: 'L2-N (V)' },
			{ itemCode: '5.3', description: 'L3-N (V)' },
			{ itemCode: '5.4', description: 'L1-L2 (V)' },
			{ itemCode: '5.5', description: 'L2-L3 (V)' },
			{ itemCode: '5.6', description: 'L3-L1 (V)' }
		]
	}
];

export const defectComponentOptions = [
	'פנלים',
	'סטרינג',
	'קונקטור',
	'כבל DC',
	'כבל AC',
	'מהפך',
	'לוח חשמל',
	'קונסטרוקציה',
	'הארקה',
	'גיד 0',
	'שילוט',
	'SPD',
	'מערכת ניטור',
	'אחר'
];

export function createAcMeasurementsFromTemplate(): AcMeasurement[] {
	return acSections.flatMap((section) =>
		section.items.map((item) => ({
			itemCode: item.itemCode,
			description: item.description,
			result: undefined,
			notes: ''
		}))
	);
}
