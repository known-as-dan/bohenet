import type { AcMeasurement } from '../models/inspection.js';

export type AcSection = {
	code: string;
	title: string;
	items: { itemCode: string; description: string }[];
};

export const acSections: AcSection[] = [
	{
		code: '1',
		title: 'מפסק ראשי',
		items: [
			{ itemCode: '1.1', description: 'כיוונון הגנה תרמית I1' },
			{ itemCode: '1.2', description: 'כיוונון הגנה מגנטית I3' },
			{ itemCode: '1.3', description: 'כיוונון זרם דלף (משולב פחת) i∆' },
			{ itemCode: '1.4', description: 'כיוונון זמן תגובה (משולב פחת) t∆' }
		]
	},
	{
		code: '2',
		title: 'לוח מאסף',
		items: [
			{ itemCode: '2.1', description: 'כיוונון הגנה תרמית I1' },
			{ itemCode: '2.2', description: 'כיוונון הגנה מגנטית I3' },
			{ itemCode: '2.3', description: 'כיוונון זרם דלף (משולב פחת) i∆' },
			{ itemCode: '2.4', description: 'כיוונון זמן תגובה (משולב פחת) t∆' }
		]
	},
	{
		code: '3',
		title: 'עכבת לולאת התקלה (L.T)',
		items: [
			{ itemCode: '3.1', description: 'L1 לוח ראשי' },
			{ itemCode: '3.2', description: 'L2 לוח ראשי' },
			{ itemCode: '3.3', description: 'L3 לוח ראשי' },
			{ itemCode: '3.4', description: 'L1 לוח מאסף' },
			{ itemCode: '3.5', description: 'L2 לוח מאסף' },
			{ itemCode: '3.6', description: 'L3 לוח מאסף' }
		]
	},
	{
		code: '4',
		title: 'מתח רשת לפני סנכרון',
		items: [
			{ itemCode: '4.1', description: 'L1-N' },
			{ itemCode: '4.2', description: 'L2-N' },
			{ itemCode: '4.3', description: 'L3-N' },
			{ itemCode: '4.4', description: 'L1-L2' },
			{ itemCode: '4.5', description: 'L1-L3' },
			{ itemCode: '4.6', description: 'L2-L3' }
		]
	},
	{
		code: '5',
		title: 'מתח רשת אחרי סנכרון',
		items: [
			{ itemCode: '5.1', description: 'L1-N' },
			{ itemCode: '5.2', description: 'L2-N' },
			{ itemCode: '5.3', description: 'L3-N' },
			{ itemCode: '5.4', description: 'L1-L2' },
			{ itemCode: '5.5', description: 'L1-L3' },
			{ itemCode: '5.6', description: 'L2-L3' }
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
