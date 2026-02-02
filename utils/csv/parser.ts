import Papa from 'papaparse';

export interface ParsedIdentity {
  email: string;
  name: string;
  role: string;
  area: string;
  criticality: string;
}

export interface ParseResult {
  data: ParsedIdentity[];
  errors: ParseError[];
  meta: {
    fields?: string[];
    delimiter: string;
    lineCount: number;
  };
}

export interface ParseError {
  row: number;
  message: string;
  field?: string;
}

const REQUIRED_FIELDS = ['email'];
const OPTIONAL_FIELDS = ['name', 'role', 'area', 'criticality'];
const ALL_FIELDS = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];

function normalizeFieldName(field: string): string {
  return field.toLowerCase().trim().replace(/[^a-z]/g, '');
}

function mapFields(row: Record<string, string>, fieldMap: Record<string, string>): ParsedIdentity {
  return {
    email: row[fieldMap.email] || '',
    name: row[fieldMap.name] || '',
    role: row[fieldMap.role] || 'other',
    area: row[fieldMap.area] || 'Other',
    criticality: row[fieldMap.criticality] || 'medium',
  };
}

function buildFieldMap(headers: string[]): Record<string, string> {
  const fieldMap: Record<string, string> = {};

  for (const header of headers) {
    const normalized = normalizeFieldName(header);

    for (const field of ALL_FIELDS) {
      if (normalized === field || normalized.includes(field)) {
        fieldMap[field] = header;
        break;
      }
    }
  }

  return fieldMap;
}

export async function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        const headers = results.meta.fields || [];
        const fieldMap = buildFieldMap(headers);

        const errors: ParseError[] = [];

        if (!fieldMap.email) {
          errors.push({
            row: 0,
            message: 'Missing required "email" column',
            field: 'email',
          });
        }

        const data: ParsedIdentity[] = [];

        for (let i = 0; i < results.data.length; i++) {
          const row = results.data[i] as Record<string, string>;
          const identity = mapFields(row, fieldMap);

          if (identity.email) {
            data.push(identity);
          } else {
            errors.push({
              row: i + 2,
              message: 'Missing email',
              field: 'email',
            });
          }
        }

        for (const papaError of results.errors) {
          errors.push({
            row: papaError.row ? papaError.row + 2 : 0,
            message: papaError.message,
          });
        }

        resolve({
          data,
          errors,
          meta: {
            fields: headers,
            delimiter: results.meta.delimiter,
            lineCount: results.data.length,
          },
        });
      },
      error: (error) => {
        resolve({
          data: [],
          errors: [{ row: 0, message: error.message }],
          meta: {
            delimiter: ',',
            lineCount: 0,
          },
        });
      },
    });
  });
}
