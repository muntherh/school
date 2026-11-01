import {describe,it,expect} from 'vitest'
import {CSVExportService} from '@/lib/services/csv-export.service'
describe('CSV safety and structure',()=>{
 it('sanitizes and quotes formulas with delimiters',()=>{expect(CSVExportService['escapeCSV']('=SUM(1,2)')).toBe('"\t=SUM(1,2)"')})
 it('quotes carriage returns',()=>{expect(CSVExportService['escapeCSV']('a\rb')).toBe('"a\rb"')})
})
