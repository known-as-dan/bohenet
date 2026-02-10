import type { ChecklistItem } from '../models/inspection.js';

export type ChecklistSection = {
	code: string;
	title: string;
	items: { sectionCode: string; description: string }[];
};

export const checklistSections: ChecklistSection[] = [
	{
		code: '1',
		title: 'בדיקה חזותית - פנלים',
		items: [
			{ sectionCode: '1.1', description: 'תקינות מכנית של הפנלים (סדקים, שברים, עיוותים)' },
			{ sectionCode: '1.2', description: 'ניקיון פני הפנלים' },
			{ sectionCode: '1.3', description: 'תקינות מסגרות הפנלים' },
			{ sectionCode: '1.4', description: 'תקינות חיבורי הארקה של מסגרות הפנלים' },
			{ sectionCode: '1.5', description: 'תקינות קופסאות חיבור (Junction Box)' },
			{ sectionCode: '1.6', description: 'תקינות קונקטורים' },
			{ sectionCode: '1.7', description: 'בדיקת הצללה על הפנלים' }
		]
	},
	{
		code: '2',
		title: 'בדיקה חזותית - קונסטרוקציה',
		items: [
			{ sectionCode: '2.1', description: 'תקינות מכנית של הקונסטרוקציה' },
			{ sectionCode: '2.2', description: 'תקינות קשרים ובורגים' },
			{ sectionCode: '2.3', description: 'תקינות חיבורי הארקה של הקונסטרוקציה' },
			{ sectionCode: '2.4', description: 'בדיקת חלודה / קורוזיה' }
		]
	},
	{
		code: '3',
		title: 'בדיקה חזותית - כבילה',
		items: [
			{ sectionCode: '3.1', description: 'תקינות כבלי DC (בידוד, שפשופים, כיפופים)' },
			{ sectionCode: '3.2', description: 'תקינות חיבורי MC4 / קונקטורים' },
			{ sectionCode: '3.3', description: 'סידור ועיגון כבלים' },
			{ sectionCode: '3.4', description: 'תקינות תעלות כבלים' },
			{ sectionCode: '3.5', description: 'תקינות כבלי AC' }
		]
	},
	{
		code: '4',
		title: 'בדיקה חזותית - מהפכים',
		items: [
			{ sectionCode: '4.1', description: 'תקינות מכנית של המהפכים' },
			{ sectionCode: '4.2', description: 'תקינות חיבורי DC למהפך' },
			{ sectionCode: '4.3', description: 'תקינות חיבורי AC מהמהפך' },
			{ sectionCode: '4.4', description: 'תקינות חיבור הארקה של המהפך' },
			{ sectionCode: '4.5', description: 'תקינות אוורור / פתחי קירור' },
			{ sectionCode: '4.6', description: 'בדיקת הודעות שגיאה במהפך' }
		]
	},
	{
		code: '5',
		title: 'בדיקה חזותית - לוחות חשמל',
		items: [
			{ sectionCode: '5.1', description: 'תקינות מכנית של לוחות החשמל' },
			{ sectionCode: '5.2', description: 'תקינות חיבורים בלוחות' },
			{ sectionCode: '5.3', description: 'תקינות מפסקים ונתיכים' },
			{ sectionCode: '5.4', description: 'שילוט ותיוג בלוחות' },
			{ sectionCode: '5.5', description: 'תקינות מגני ברקים (SPD)' },
			{ sectionCode: '5.6', description: 'תקינות מפסקי DC' }
		]
	},
	{
		code: '6',
		title: 'בדיקה חזותית - הארקה',
		items: [
			{ sectionCode: '6.1', description: 'תקינות מערכת ההארקה' },
			{ sectionCode: '6.2', description: 'תקינות חיבורי הארקה (בורגים, כבלים)' },
			{ sectionCode: '6.3', description: 'רציפות מערכת הארקה' },
			{ sectionCode: '6.4', description: 'תקינות פס שוואה' }
		]
	},
	{
		code: '7',
		title: 'בדיקה חזותית - בטיחות',
		items: [
			{ sectionCode: '7.1', description: 'שילוט אזהרה ובטיחות' },
			{ sectionCode: '7.2', description: 'נגישות למפסקי חירום' },
			{ sectionCode: '7.3', description: 'תקינות מפסק כיבוי ראשי (AC)' },
			{ sectionCode: '7.4', description: 'תקינות מפסק כיבוי DC' }
		]
	},
	{
		code: '8',
		title: 'בדיקה חזותית - מערכת ניטור',
		items: [
			{ sectionCode: '8.1', description: 'תקינות מערכת הניטור' },
			{ sectionCode: '8.2', description: 'תקשורת עם המהפכים' },
			{ sectionCode: '8.3', description: 'גישה מרחוק למערכת הניטור' },
			{ sectionCode: '8.4', description: 'בדיקת דיוק נתוני הניטור' }
		]
	}
];

export function createChecklistFromTemplate(): ChecklistItem[] {
	return checklistSections.flatMap((section) =>
		section.items.map((item) => ({
			sectionCode: item.sectionCode,
			description: item.description,
			status: undefined,
			notes: ''
		}))
	);
}
