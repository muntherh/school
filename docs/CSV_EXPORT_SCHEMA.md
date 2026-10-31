# CSV Export Schema and Documentation

## Overview

This document describes the CSV export schema for the School Disciplinary Management System (SDMS), including field definitions, data formats, authorization rules, and example exports.

## CSV Schema

### Base Fields (Available to All Authorized Roles)

| Field Name | Description | Data Type | Format | Example |
|------------|-------------|-----------|--------|---------|
| referenceNumber | Unique case reference identifier | String | CASE-YYYY-NNN | CASE-2024-001 |
| studentId | Student identifier | String | STU... | STU001 |
| studentName | Student full name | String | Plain text | Alex Thompson |
| classGrade | Student class/grade | String | NN[A-Z] | 10A |
| incidentDate | Date of incident | Date | YYYY-MM-DD | 2024-01-15 |
| category | Incident category | String | Plain text | Behavioral Issue |
| status | Case status | String | Enum value | SUBMITTED |
| submittedAt | Date case was submitted | Date | YYYY-MM-DD | 2024-01-15 |
| reporterName | Name of staff who reported | String | Plain text | Mr. Michael Chen |

### Extended Fields (Principal and Admin Only)

| Field Name | Description | Data Type | Format | Example |
|------------|-------------|-----------|--------|---------|
| description | Detailed incident description | Text | Plain text | Student was disruptive... |
| location | Incident location | String | Plain text | Science Lab, Room 205 |
| witnesses | Witness names/descriptions | Text | Plain text | Ms. Emily Davis... |
| decision | Principal decision | String | Enum value | APPROVED |
| decisionDate | Date of decision | Date | YYYY-MM-DD | 2024-01-16 |
| actionType | Disciplinary action type | String | Plain text | Detention |
| actionStartDate | Action start date | Date | YYYY-MM-DD | 2024-01-20 |
| actionEndDate | Action end date | Date | YYYY-MM-DD | 2024-01-20 |
| interventionType | Counselling intervention type | String | Plain text | Individual Counselling |
| interventionDate | Intervention date | Date | YYYY-MM-DD | 2024-01-17 |
| followUpStatus | Follow-up status | String | Enum value | PENDING |
| followUpDueDate | Follow-up due date | Date | YYYY-MM-DD | 2024-01-24 |
| closedAt | Case closure date | Date | YYYY-MM-DD | 2024-01-25 |

### Confidential Fields (Principal and Counsellor with Authorization)

| Field Name | Description | Data Type | Format | Example |
|------------|-------------|-----------|--------|---------|
| confidentialNotes | Confidential counselling notes | Text | Plain text | Student expressed concern... |

## Status Values

| Status | Description |
|--------|-------------|
| SUBMITTED | Case submitted by teacher, awaiting review |
| UNDER_REVIEW | Case under principal review |
| CLARIFICATION_REQUIRED | Additional information needed from reporter |
| ASSIGNED | Case assigned to staff member |
| ACTION_PENDING | Disciplinary action pending |
| FOLLOW_UP_PENDING | Follow-up activities pending |
| CLOSED | Case resolved and closed |
| REJECTED | Case rejected without further action |
| REOPENED | Previously closed case reopened |

## Category Values

Common incident categories include:
- Behavioral Issue
- Academic Dishonesty
- Safety Violation
- Attendance Issue
- Bullying/Harassment
- Property Damage
- Other

## CSV Format Specifications

### Encoding
- **Character Encoding**: UTF-8
- **BOM**: UTF-8 BOM (Byte Order Mark) included for Excel compatibility
- **Line Endings**: CRLF (\r\n)

### Field Delimiters
- **Field Separator**: Comma (,)
- **Text Qualifier**: Double quote (")

### Special Character Handling
- **Commas**: Fields containing commas are wrapped in quotes
- **Quotes**: Quotes are escaped by doubling ("")
- **Newlines**: Fields containing newlines are wrapped in quotes
- **Tabs**: Fields containing tabs are wrapped in quotes

### Formula Injection Prevention
Values starting with the following characters are prefixed with a tab character to prevent CSV formula injection:
- `=` (equals)
- `+` (plus)
- `-` (minus)
- `@` (at sign)

### Date Formats
- **Dates**: YYYY-MM-DD (ISO 8601 date format)
- **DateTimes**: YYYY-MM-DDTHH:MM:SSZ (ISO 8601 datetime format)

### Null/Empty Values
- **Null values**: Empty string
- **Empty strings**: Empty string (no quotes)

## Authorization Rules

### Export Permission
- **Principal**: Can export all cases with base and extended fields
- **Admin**: Can export all cases with base and extended fields
- **Teacher**: Cannot export data
- **Counsellor**: Cannot export data

### Field Access by Role

| Role | Base Fields | Extended Fields | Confidential Fields |
|------|-------------|----------------|---------------------|
| Teacher | N/A (cannot export) | N/A | N/A |
| Counsellor | N/A (cannot export) | N/A | N/A |
| Principal | ✓ | ✓ | ✓ (with explicit authorization) |
| Admin | ✓ | ✓ | ✗ |

### Data Filtering by Role
- **Teachers**: Can only view their own cases (if export were permitted)
- **Principals**: Can view all cases
- **Admins**: Can view all cases
- **Counsellors**: Can view assigned cases only (if export were permitted)

## Export Limits

- **Maximum Records**: 10,000 records per export
- **Pagination**: Required if dataset exceeds limit
- **Streaming**: Not implemented (future enhancement)

## Audit Logging

Every export operation logs:
- **Exporting User**: User ID and name
- **Timestamp**: When export was initiated
- **Applied Filters**: Date range, status, category, etc.
- **Exported Fields**: List of fields included
- **Record Count**: Number of records exported
- **Filename**: Generated filename
- **Success/Failure**: Export result

Failed export attempts also log:
- **Error Message**: Reason for failure

## Example CSV Exports

### Example 1: Base Fields Export (Principal)

```csv
referenceNumber,studentId,studentName,classGrade,incidentDate,category,status,submittedAt,reporterName
CASE-2024-001,STU001,Alex Thompson,10A,2024-01-15,Behavioral Issue,SUBMITTED,2024-01-15,Mr. Michael Chen
CASE-2024-002,STU002,Jordan Martinez,10B,2024-01-18,Academic Dishonesty,UNDER_REVIEW,2024-01-18,Ms. Emily Davis
CASE-2024-003,STU003,Taylor Kim,11A,2024-01-20,Safety Violation,CLARIFICATION_REQUIRED,2024-01-20,Mr. Michael Chen
```

### Example 2: Extended Fields Export (Principal)

```csv
referenceNumber,studentId,studentName,description,location,witnesses,decision,decisionDate,actionType
CASE-2024-001,STU001,Alex Thompson,"Student was disruptive during class, repeatedly interrupting the lesson",Science Lab, Room 205,"Ms. Emily Davis (co-teacher)",,,
CASE-2024-002,STU002,Jordan Martinez,"Student was found copying answers from another student during examination",Examination Hall,Proctor Mr. Robert Brown,APPROVED,2024-01-19,Detention
CASE-2024-005,STU002,Jordan Martinez,"Student repeatedly violated school dress code policy",Various locations,"Multiple staff members",APPROVED,2024-01-12,Detention
```

### Example 3: Confidential Fields Export (Principal with Authorization)

```csv
referenceNumber,studentId,studentName,confidentialNotes
CASE-2024-006,STU003,Taylor Kim,"Student expressed remorse and understanding of the incident. Discussed conflict resolution strategies."
CASE-2024-004,STU001,Alex Thompson,"Initial assessment indicates underlying family stress. Recommend family meeting."
```

### Example 4: Special Characters Handling

```csv
referenceNumber,studentName,description,location
CASE-2024-008,STU004,"Smith, John","Student said ""I didn't do it"" when questioned","Room 101, Building A"
CASE-2024-009,STU005,"García, José","Incident occurred during lunch period
Student was seen running in hallway",Cafeteria
```

### Example 5: Formula Injection Prevention

```csv
referenceNumber,studentId,description
CASE-2024-010,STU006,"=SUM(A1:A10)"  // Escaped as "\t=SUM(A1:A10)"
CASE-2024-011,STU007,"+1+2"  // Escaped as "\t+1+2"
CASE-2024-012,STU008,"@SUM(1,2)"  // Escaped as "\t@SUM(1,2)"
```

## API Usage

### Export Endpoint

**POST** `/api/export/cases`

**Request Body:**
```json
{
  "filters": {
    "dateFrom": "2024-01-01",
    "dateTo": "2024-01-31",
    "status": "CLOSED",
    "category": "Behavioral Issue",
    "classGrade": "10A"
  },
  "fields": [
    "referenceNumber",
    "studentId",
    "studentName",
    "status"
  ],
  "includeConfidential": false
}
```

**Response:**
- **Success**: CSV file with `Content-Type: text/csv; charset=utf-8`
- **Failure**: JSON error response

### Statistics Endpoint

**GET** `/api/export/cases/stats?dateFrom=2024-01-01&status=CLOSED`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCount": 150,
    "statusCounts": [
      { "status": "CLOSED", "count": 150 }
    ],
    "categoryCounts": [
      { "category": "Behavioral Issue", "count": 80 },
      { "category": "Academic Dishonesty", "count": 40 },
      { "category": "Safety Violation", "count": 30 }
    ],
    "maxExportLimit": 10000,
    "requiresPagination": false
  }
}
```

## Security Considerations

### Data Protection
- **Authorization**: Backend validates user role before export
- **Field Filtering**: Unauthorized fields are excluded at database level
- **Audit Trail**: All exports are logged with user and metadata
- **Encryption**: (HTTPS required in production)

### Confidentiality
- **Confidential Notes**: Only accessible with explicit authorization
- **Role-Based Access**: Strict role enforcement at API level
- **No Frontend Filtering**: All filtering happens server-side

### Injection Prevention
- **CSV Formula Injection**: Values starting with `=`, `+`, `-`, `@` are escaped
- **SQL Injection**: Prisma ORM prevents SQL injection
- **XSS**: CSV is downloaded as file, not rendered in browser

## Testing

### Test Scenarios

1. **Teacher Export Restriction**: Verify teacher cannot export data
2. **Counsellor Export Restriction**: Verify counsellor cannot export data
3. **Unauthorized Field Access**: Verify principal cannot request non-existent fields
4. **Confidential Field Access**: Verify confidential notes require explicit authorization
5. **Formula Injection**: Verify values starting with `=`, `+`, `-`, `@` are escaped
6. **Special Characters**: Verify commas, quotes, newlines are handled correctly
7. **Unicode Support**: Verify Unicode characters are preserved
8. **Export Limits**: Verify exports exceeding 10,000 records are rejected
9. **Audit Logging**: Verify all exports are logged with metadata
10. **Date Formatting**: Verify dates are in YYYY-MM-DD format

### Test Data

All test data uses fictional student information:
- **Student IDs**: STU001, STU002, STU003, etc.
- **Names**: Alex Thompson, Jordan Martinez, Taylor Kim, etc.
- **Descriptions**: Generic behavioral/academic incidents
- **No Real Data**: Never use actual student information in development

## Compliance

### Data Protection Laws
- **FERPA**: Family Educational Rights and Privacy Act compliance
- **GDPR**: General Data Protection Regulation considerations
- **Local Regulations**: Follow applicable local data protection laws

### Retention Policy
- **Audit Logs**: Retained for minimum 7 years
- **Export Logs**: Retained for minimum 3 years
- **Case Data**: Retained according to school policy

### Access Control
- **Principle of Least Privilege**: Users only access necessary data
- **Need-to-Know**: Confidential notes restricted to authorized personnel
- **Audit Trail**: All access logged for accountability

## Troubleshooting

### Common Issues

**Export Fails with "Unauthorized fields" Error**
- Verify requested fields are allowed for user role
- Check field names match schema exactly
- Ensure confidential fields are only requested with authorization

**CSV Opens with Incorrect Characters in Excel**
- Verify UTF-8 BOM is included (should be in export)
- Try opening in a text editor first to verify encoding
- Ensure Excel is configured to handle UTF-8

**Export Takes Too Long**
- Check if dataset exceeds 10,000 record limit
- Consider adding date range filters to reduce dataset size
- Review database performance and indexes

**Formula Injection Warnings**
- Verify values starting with `=`, `+`, `-`, `@` are prefixed with tab
- Check that CSV is not being opened with automatic formula evaluation

## Future Enhancements

### Planned Features
- **Streaming Export**: Support for very large datasets
- **Scheduled Exports**: Automated periodic exports
- **Export Templates**: Predefined field selections
- **Export History**: View previous exports and re-download
- **Advanced Filtering**: More complex filter combinations
- **Export to Other Formats**: Excel, PDF, JSON

### Performance Optimizations
- **Database Query Optimization**: Add indexes for export queries
- **Caching**: Cache frequently used export statistics
- **Parallel Processing**: Process large exports in chunks
- **Compression**: Compress large CSV files

## References

- **RFC 4180**: CSV (Comma-Separated Values) specification
- **ISO 8601**: Date and time format standard
- **UTF-8**: Character encoding standard
- **FERPA**: Family Educational Rights and Privacy Act
- **GDPR**: General Data Protection Regulation

## Changelog

### Version 1.0 (2024-01-28)
- Initial CSV export implementation
- Base, extended, and confidential field support
- Role-based authorization
- Formula injection prevention
- Audit logging
- Export limits (10,000 records)
- UTF-8 encoding with BOM
