# AddNewCompanyForm - Updated with Complete Payload

## Overview
The `AddNewCompanyForm` component has been completely updated to support the full company creation payload with all required and optional fields.

## New Form Structure (6 Steps)

### Step 1: Basic Info
- Company Name (required)
- Domain
- Email Address

### Step 2: Contact Details
- Phone Number
- Country (searchable dropdown - same as user form)
- City

### Step 3: Company Admin (NEW)
- **Select Company Admin** (required)
- Searchable dropdown with company admins
- Shows admin name, email, and phone
- Search by name or email
- Fetches from `/auth/users/company-admins` endpoint

### Step 4: Categories
- Select Level 2 Categories
- Automatically links related Level 1 and Level 3 categories
- Shows summary statistics

### Step 5: Plan & Details (EXPANDED)
- Plan Selection (basic, pro, mid)
- Industry (new field)
- Company Size (1-10, 11-50, 51-100, 100-500, 500+)

### Step 6: Notifications (NEW)
- Email Notifications (toggle)
- SMS Notifications (toggle)
- In-App Notifications (toggle)

## Complete API Payload

```json
{
  "name": "Acme Corp",
  "domain": "acme.com",
  "email": "admin@acme.com",
  "phone": "+1234567890",
  "country": "US",
  "city": "New York",
  "tier": "Pro",
  "company_admin_id": "550e8400-e29b-41d4-a716-446655440000",
  "category_ids": ["651f2c80c6b9b5a7cdfe1909", "651f2c80c6b9b5a7cdfe1910"],
  "metadata": {
    "industry": "Technology",
    "size": "100-500"
  },
  "notification_preferences": {
    "email": true,
    "sms": true,
    "inApp": true
  }
}
```

## Key Features

### 1. Company Admin Selection
- **Endpoint**: `/auth/users/company-admins`
- **Searchable**: Search by first name, last name, or email
- **Display Format**: "FirstName LastName (email)"
- **Additional Info**: Shows phone number in dropdown

### 2. Searchable Dropdowns
- **Countries**: Similar to country field in user form
- **Company Admins**: New searchable dropdown implementation
- Both support autocomplete and filtering

### 3. Form Validation
- Required fields validated on each step
- Email validation
- Phone validation (E.164 format)
- Progress tracking with sidebar

### 4. Data Handling
- Supports both create and edit modes
- Populates existing data when editing
- Extracts metadata and notification_preferences from nested structures

## State Management

```javascript
const [formData, setFormData] = useState({
  name: "",
  domain: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  tier: "",
  company_admin_id: "",        // NEW
  category_ids: [],
  industry: "",                 // NEW
  size: "",                      // NEW
  notificationsEmail: true,     // NEW
  notificationsSms: true,       // NEW
  notificationsInApp: true,     // NEW
});

const [companyAdmins, setCompanyAdmins] = useState([]);    // NEW
const [adminSearch, setAdminSearch] = useState("");        // NEW
const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false); // NEW
```

## API Calls

### Fetch Company Admins
```javascript
useEffect(() => {
  const res = await UserService.getCompanyAdmins?.() ||
    (await fetch("/auth/users/company-admins").then((r) => r.json()));
  const admins = res?.admins || res?.data || [];
  setCompanyAdmins(admins);
}, []);
```

### Create Company
```javascript
const payload = {
  name: formData.name,
  domain: formData.domain || null,
  email: formData.email || null,
  phone: formData.phone || null,
  country: formData.country || null,
  city: formData.city || null,
  tier: formData.tier || null,
  company_admin_id: formData.company_admin_id || null,
  category_ids: formData.category_ids || [],
  metadata: {
    industry: formData.industry || null,
    size: formData.size || null,
  },
  notification_preferences: {
    email: formData.notificationsEmail,
    sms: formData.notificationsSms,
    inApp: formData.notificationsInApp,
  },
};

const res = await CompanyService.create(payload);
```

## File Location
`/home/frank-dev/Desktop/projects/invexis_admin_dashboard/src/components/forms/AddNewCompanyForm.jsx`

## Dependencies
- `next/navigation` - useRouter
- `lucide-react` - Icons
- `@/services/CompanyService` - Company API
- `@/services/CategoryService` - Categories API
- `@/services/UserService` - User API (for company admins)
- `@/constants/countries` - Countries list
- `@/providers/NotificationProvider` - Toast notifications

## UX Improvements

✅ **Searchable Admin Selection** - Find the right company admin quickly
✅ **6-Step Progressive Form** - Organized sections for better UX
✅ **Real-time Search** - Filter company admins by name or email as you type
✅ **Complete Payload Support** - All fields mapped to API requirements
✅ **Nested Data Handling** - Metadata and notification_preferences properly structured
✅ **Edit Support** - Form populates existing data correctly

## Notes

- Company admin selection is required for company creation
- All optional fields send `null` if empty (not undefined)
- Notification preferences default to `true`
- Form supports both create and update operations
- Categories are fetched directly from API (no caching)
