# Characteristics — Two Systems Explained

The system has **two separate characteristic systems** that serve different purposes. This is one of the most confusing parts of the current UI because they're presented under "Additional Characteristics" without explanation.

---

## System 1: Standard Characteristics (Structured)

**Used for:** Searchable, filterable product attributes with predefined value sets.

**Example use cases:**
- Color: [Red, Blue, Green, Black]
- Size: [S, M, L, XL, XXL]
- Material: free text
- Waterproof: [Yes, No]

### Entity Hierarchy

```
CharacteristicsGroup
  └── Characteristic (type: TEXT | SELECT | RADIO | CHECKBOX)
        └── CharacteristicValue[] (for SELECT, RADIO, CHECKBOX types)

TypeOfNomenclature
  └── CharacteristicsGroup  (group is linked to a nomenclature type)
        └── Characteristic

Product (via TypeOfNomenclature)
  └── ProductCharacteristic (assigned value for a specific characteristic)
        └── value: string[]  (multi-value for CHECKBOX, single for others)
```

### Characteristic Types

| Type | Input UI | Value storage | Use case |
|---|---|---|---|
| `TEXT` | Free text input | Single string | Description, notes, codes |
| `SELECT` | Single dropdown | Single string (one of `values[]`) | Category, grade, class |
| `RADIO` | Radio buttons | Single string (one of `values[]`) | Yes/No, binary choices |
| `CHECKBOX` | Multi checkboxes | Array of strings | Multiple applicable tags |

### CharacteristicsGroup

Groups related characteristics together and links them to a `TypeOfNomenclature`.

```
CharacteristicsGroup {
  id, name, description
  typeOfNomenclatureId  → TypeOfNomenclature
  typeOfNomenclature?: { id, name }
}
```

**Key rule:** A product only sees characteristic groups that belong to its `TypeOfNomenclature`.

### Adding a Characteristic to a Product

1. Go to product detail → "Characteristics" tab
2. Click "Assign Characteristic"
3. Form shows all characteristics from groups linked to product's TypeOfNomenclature
4. User selects characteristic and enters/selects value
5. Saved as `ProductCharacteristic { productId, characteristicId, value[] }`

### Bulk Assignment

The "All Characteristics" tab shows all groups at once with inline editing.
The "Table Characteristics" tab shows dynamic table rows (System 2).

### Import

Characteristics can be imported via Excel:
- Template download for characteristics assignment
- Upload with productId + characteristicKey + value columns
- Validation before execution

---

## System 2: Dynamic Table Characteristics

**Used for:** Complex, multi-column data that doesn't fit a simple key-value model.

**Example use cases:**
- Technical specifications table with rows for different test conditions
- Regional pricing adjustments
- Multi-attribute configuration matrices
- Dealer-specific pricing tiers
- Size grids (S/M/L × Color × Qty)

### Why a "Dynamic Table"?

Some product data is inherently tabular — you can't express it as single characteristic values. For example, a product's power consumption might vary by load level:

```
| Load Level | Power (W) | Efficiency (%) | Temperature (°C) |
|------------|-----------|----------------|-----------------|
| 10%        | 50        | 85             | 35              |
| 50%        | 200       | 90             | 55              |
| 100%       | 380       | 88             | 70              |
```

Standard characteristics can't represent this. Dynamic tables can.

### Entity Hierarchy

```
DynamicCharacteristicsTable
  ├── linked to CharacteristicsGroup
  │     └── linked to TypeOfNomenclature
  ├── columns: DynamicColumn[]
  │     ├── name, key, dataType, position, required
  │     └── dataType: STRING | NUMBER | BOOLEAN | DATE
  └── rows: DynamicRow[]
        └── values: Record<columnKey, value>

Product
  └── ProductTableCharacteristic (link product to specific rows of a table)
```

### DynamicColumn Data Types

| Type | Input UI | Description |
|---|---|---|
| `STRING` | Text field | Any text value |
| `NUMBER` | Number input | Numeric value (decimal supported) |
| `BOOLEAN` | Toggle/checkbox | True/False |
| `DATE` | Date picker | ISO date string |

### Operations on Dynamic Tables

- **Create table** — give it a name, link to a CharacteristicsGroup
- **Add columns** — define name, key, dataType, position, required flag
- **Reorder columns** — drag to change position
- **Add rows** — fill in values for each column
- **Edit cell** — inline editing
- **Delete row** — soft or hard delete
- **Import rows** — Excel import of rows
- **Link to product** — link specific rows to a product

---

## Comparison: When to Use Which System

| Scenario | Use System 1 (Standard) | Use System 2 (Dynamic Table) |
|---|---|---|
| Color options | ✓ | |
| Single-value attribute | ✓ | |
| Searchable/filterable | ✓ | |
| Multi-row tabular data | | ✓ |
| Complex configurations | | ✓ |
| Dynamic columns that change per product | | ✓ |
| Integration field mapping | ✓ (structured) | ✓ (as table rows) |

---

## Naming Problem in Current UI

**Current sidebar label:** "Additional Characteristics > Dynamic Table"

**User's confusion:** "What is a dynamic table? Is it different from characteristics? Why is there an 'Additional' characteristics section?"

**Proposed new naming:**

```
CHARACTERISTICS
├── Standard Characteristics
│     (Searchable product attributes with value lists)
├── Characteristic Groups
│     (Organize characteristics by product type)
└── Specification Tables
      (Custom tabular data attached to products)
```

---

## Characteristic Groups — Two Roles

CharacteristicsGroup plays two roles:
1. **Groups standard characteristics** — so they appear together in UI
2. **Defines which system each group belongs to**

The 2nd role is important for dealers vs accounting:

**Dealer Characteristic System:**
- Groups configured for dealer-facing characteristics
- Used in dealer discount and pricing logic
- Synced to dealer-facing external systems (CRM)

**Accounting Characteristic System:**
- Groups configured for accounting-facing characteristics
- Used in SAP/ERP sync
- Contain fiscal codes, accounting categories, etc.

The `CharacteristicsGroup.typeOfNomenclatureId` field determines which nomenclature type this group applies to. Different nomenclature types can represent "dealer" vs "accounting" product classification.

---

## Integration Config — How Characteristics Flow to External Systems

When building an integration config (`IntegrationConfig`), the section for PRODUCT includes:

```
ConfigSection (sectionType: PRODUCT)
  └── ConfigNomenclature (per typeOfNomenclature)
        ├── selectedItems: SelectedItem[]
        │     ├── { itemType: 'GROUP', itemId: characteristicsGroupId }
        │     ├── { itemType: 'CHARACTERISTIC', itemId: characteristicId }
        │     └── { itemType: 'DYNAMIC_TABLE', itemId: tableId }
        └── mappings: IntegrationMapping[]
              └── { sourcePath: 'characteristics.color', targetPath: 'color', ... }
```

So: you select which characteristic groups or individual characteristics to include in the export, then define field-by-field mappings to the external system's schema.

---

## Characteristics Import

Two import types exist:
1. **Import Characteristics** (`characteristicImportApi`) — bulk create/update characteristics and their values
2. **Product Characteristic Link Import** (`productCharacteristicLinkImportApi`) — assign characteristics to products in bulk

Template columns for Product Characteristic Link Import:
```
productId | characteristicId (or key) | value
```

---

## Product "All Characteristics" Tab — Current Logic

The `ProductAllCharacteristicsTab` component shows:
1. All CharacteristicsGroups linked to product's TypeOfNomenclature
2. For each group: the list of characteristics
3. For each characteristic: current assigned value (if any) with inline edit
4. For each group that has a dynamic table: the `DynamicTableRow` component
5. Save/cancel buttons appear when any value is modified

**CharacteristicValueEditor** renders different input per type:
- TEXT → `<input type="text">`
- SELECT → `<select>` from characteristic.values[]
- RADIO → `<radio>` group
- CHECKBOX → `<checkbox>` group

---

## Data Quality Checks Needed

| Check | Description |
|---|---|
| Products with no characteristics | Products that have zero assigned characteristics |
| Incomplete required characteristics | Products missing characteristics marked as required in the group |
| Characteristics assigned but no value | ProductCharacteristic record exists but value is empty |
| Orphaned characteristic values | Values for characteristics that no longer exist |
| Dynamic table rows with empty required columns | Rows missing values for columns marked required |
