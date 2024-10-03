import * as XLSX from 'xlsx';

interface ColumnObj {
    name: string,
    key: number
}

export interface SheetObj {
    name: string,
    rows: unknown[],
    cols: ColumnObj[] | ColumnObj
}

type ExcelRendererCallback = (err: Error | null, resp: SheetObj[]) => void;

/**
 * Adapting react-excel-renderer to read multiple sheets.
 * @param file
 * @param callback
 * @constructor
 * @link Original Library - https://github.com/ashishd751/react-excel-renderer/tree/master
 */
export function ExcelRenderer(file: File, callback: ExcelRendererCallback) {
    console.log('file', file);
    console.log('callback', callback);
    return new Promise(function(resolve, reject) {
        if (reject) {
            console.log('Rejected: ', reject);
        }
        const reader = new FileReader();
        const rABS = !!reader.readAsBinaryString;
        reader.onload = function(e) {
            /* Parse data */
            const bstr = e.target?.result;

            // The Excel workbook
            const wb = XLSX.read(bstr, { type: rABS ? "binary" : "array" });

            // Initialize the data variable
            const data: SheetObj[] = [];

            // Loop through each sheet and assemble its formatted data
            wb.SheetNames.forEach((sheet: string) => {

                // The Excel worksheet
                const ws = wb.Sheets[sheet];

                /* Convert array of arrays */
                const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
                const cols = ws["!ref"] ? make_cols(ws["!ref"]) : { name: 'null', key: 0};

                const sheetData = { name: sheet, rows: rows, cols: cols };

                data.push(sheetData);
            })

            resolve(data);
            return callback(null, data);
        };
        if (file && rABS) reader.readAsBinaryString(file);
        else reader.readAsArrayBuffer(file);
    });
}

function make_cols(refstr: string) {
    const o = [],
        C = XLSX.utils.decode_range(refstr).e.c + 1;
    for (let i = 0; i < C; ++i) {
        o[i] = { name: XLSX.utils.encode_col(i), key: i };
    }
    return o;
}