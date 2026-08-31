/**
 * Form Schema Utilities
 * Functions for migrating, validating, and manipulating form schemas
 */

/**
 * Migrate V1 schema to V2 (backward compatibility)
 * V1: fields array only
 * V2: fields array + layout.rows structure
 *
 * @param {object} schema - Form schema object
 * @returns {object} Migrated V2 schema
 */
export const migrateFormSchema = (schema) => {
  // Already V2
  if (schema && schema.version === 2) {
    return schema;
  }

  // Null or empty schema
  if (!schema || !schema.fields || schema.fields.length === 0) {
    return {
      version: 2,
      layout: { rows: [] },
      fields: [],
    };
  }

  const fields = schema.fields || [];

  // Create a 1-column row for each field (maintain original order)
  const rows = fields.map((field) => ({
    id: `row_migrated_${field.id}`,
    columns: 1,
    fields: [field.id],
  }));

  // Add rowId to each field
  const migratedFields = fields.map((field) => ({
    ...field,
    rowId: `row_migrated_${field.id}`,
  }));

  return {
    version: 2,
    layout: { rows },
    fields: migratedFields,
  };
};

/**
 * Group fields by row for rendering
 * @param {array} rows - Array of row objects
 * @param {array} fields - Array of field objects
 * @returns {array} Array of rows with populated field objects
 */
export const groupFieldsByRow = (rows, fields) => {
  if (!rows || !fields) {
    return [];
  }

  const fieldsMap = Object.fromEntries(fields.map((f) => [f.id, f]));

  return rows.map((row, index) => ({
    ...row,
    displayOrder: index + 1,
    fields: (row.fields || [])
      .map((fieldId) => fieldsMap[fieldId])
      .filter(Boolean), // Remove any undefined fields
  }));
};

/**
 * Get unassigned fields (fields without a rowId or whose row doesn't exist)
 * @param {array} rows - Array of row objects
 * @param {array} fields - Array of field objects
 * @returns {array} Array of unassigned field objects
 */
export const getUnassignedFields = (rows, fields) => {
  if (!fields) {
    return [];
  }

  const rowIds = new Set((rows || []).map((r) => r.id));

  return fields.filter((field) => {
    return !field.rowId || !rowIds.has(field.rowId);
  });
};

/**
 * Validate row configuration
 * @param {array} rows - Array of row objects
 * @param {array} fields - Array of field objects
 * @returns {array} Array of error messages (empty if valid)
 */
export const validateRowConfig = (rows, fields) => {
  const errors = [];

  if (!rows || !fields) {
    return errors;
  }

  const fieldIds = new Set(fields.map((f) => f.id));

  rows.forEach((row, index) => {
    // Validate columns
    if (row.columns < 1 || row.columns > 3) {
      errors.push(`Row ${index + 1}: columns must be 1, 2, or 3 (got ${row.columns})`);
    }

    // Validate field count
    if ((row.fields || []).length > row.columns) {
      errors.push(
        `Row ${index + 1}: has ${row.fields.length} fields but only ${row.columns} columns`
      );
    }

    // Validate field existence
    (row.fields || []).forEach((fieldId) => {
      if (!fieldIds.has(fieldId)) {
        errors.push(`Row ${index + 1}: references non-existent field ${fieldId}`);
      }
    });

    // Check for duplicate field IDs in row
    const uniqueFields = new Set(row.fields || []);
    if (uniqueFields.size !== (row.fields || []).length) {
      errors.push(`Row ${index + 1}: contains duplicate field IDs`);
    }
  });

  // Check for fields assigned to multiple rows
  const fieldRowMap = {};
  rows.forEach((row, rowIndex) => {
    (row.fields || []).forEach((fieldId) => {
      if (fieldRowMap[fieldId] !== undefined) {
        errors.push(
          `Field ${fieldId} is assigned to both row ${fieldRowMap[fieldId] + 1} and row ${rowIndex + 1}`
        );
      } else {
        fieldRowMap[fieldId] = rowIndex;
      }
    });
  });

  return errors;
};

/**
 * Auto-assign unassigned fields to new rows
 * @param {array} rows - Current rows
 * @param {array} fields - All fields
 * @returns {array} Updated rows array with new rows for unassigned fields
 */
export const autoAssignUnassignedFields = (rows, fields) => {
  const unassigned = getUnassignedFields(rows, fields);

  if (unassigned.length === 0) {
    return rows;
  }

  const newRows = unassigned.map((field) => ({
    id: `row_auto_${Date.now()}_${field.id}`,
    columns: 1,
    fields: [field.id],
  }));

  return [...rows, ...newRows];
};

/**
 * Remove field from row
 * @param {array} rows - Current rows
 * @param {string} fieldId - Field ID to remove
 * @returns {array} Updated rows array
 */
export const removeFieldFromRows = (rows, fieldId) => {
  return rows
    .map((row) => ({
      ...row,
      fields: (row.fields || []).filter((fId) => fId !== fieldId),
    }))
    .filter((row) => row.fields.length > 0); // Remove empty rows
};

/**
 * Add field to row
 * @param {array} rows - Current rows
 * @param {string} rowId - Row ID to add field to
 * @param {string} fieldId - Field ID to add
 * @returns {object} { success: boolean, rows: array, error: string|null }
 */
export const addFieldToRow = (rows, rowId, fieldId) => {
  const row = rows.find((r) => r.id === rowId);

  if (!row) {
    return {
      success: false,
      rows,
      error: 'Row not found',
    };
  }

  if ((row.fields || []).length >= row.columns) {
    return {
      success: false,
      rows,
      error: `Row is full (${row.columns}/${row.columns} columns used)`,
    };
  }

  if ((row.fields || []).includes(fieldId)) {
    return {
      success: false,
      rows,
      error: 'Field already in this row',
    };
  }

  const updatedRows = rows.map((r) =>
    r.id === rowId
      ? { ...r, fields: [...(r.fields || []), fieldId] }
      : r
  );

  return {
    success: true,
    rows: updatedRows,
    error: null,
  };
};

/**
 * Update row columns (with validation)
 * @param {array} rows - Current rows
 * @param {string} rowId - Row ID to update
 * @param {number} newColumns - New column count (1, 2, or 3)
 * @returns {object} { success: boolean, rows: array, error: string|null }
 */
export const updateRowColumns = (rows, rowId, newColumns) => {
  if (newColumns < 1 || newColumns > 3) {
    return {
      success: false,
      rows,
      error: 'Columns must be 1, 2, or 3',
    };
  }

  const row = rows.find((r) => r.id === rowId);

  if (!row) {
    return {
      success: false,
      rows,
      error: 'Row not found',
    };
  }

  const fieldCount = (row.fields || []).length;
  if (fieldCount > newColumns) {
    return {
      success: false,
      rows,
      error: `Cannot reduce to ${newColumns} columns. Row has ${fieldCount} fields. Remove fields first.`,
    };
  }

  const updatedRows = rows.map((r) =>
    r.id === rowId ? { ...r, columns: newColumns } : r
  );

  return {
    success: true,
    rows: updatedRows,
    error: null,
  };
};

/**
 * Build final schema for saving (with cleanup and ordering)
 * @param {array} rows - Current rows
 * @param {array} fields - Current fields
 * @returns {object} Clean V2 schema ready for saving
 */
export const buildFinalSchema = (rows, fields) => {
  // Order rows
  const orderedRows = rows.map((row, index) => ({
    id: row.id,
    columns: row.columns,
    fields: row.fields || [],
    displayOrder: index,
  }));

  // Order fields
  const orderedFields = fields.map((field, index) => ({
    ...field,
    order: index,
  }));

  return {
    version: 2,
    layout: {
      rows: orderedRows,
    },
    fields: orderedFields,
  };
};

/**
 * Check if schema is V2
 * @param {object} schema - Schema object
 * @returns {boolean} True if V2 schema
 */
export const isV2Schema = (schema) => {
  return schema && schema.version === 2;
};

/**
 * Get available rows for field assignment
 * (rows that have space for more fields)
 * @param {array} rows - Current rows
 * @returns {array} Rows with available space
 */
export const getAvailableRows = (rows) => {
  return (rows || []).filter((row) => {
    const fieldCount = (row.fields || []).length;
    return fieldCount < row.columns;
  });
};
