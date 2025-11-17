# UI Changes for Self-Hosted Controller Support

## 1. Admin Token Dialog (Enhanced)

**Before:**
```
┌─────────────────────────────────────┐
│         Admin Token                 │
├─────────────────────────────────────┤
│                                     │
│  [Token Input Field____________]   │
│                                     │
│              [Confirm] [Cancel]     │
└─────────────────────────────────────┘
```

**After:**
```
┌─────────────────────────────────────┐
│    Admin Token & Controller         │
├─────────────────────────────────────┤
│  Admin Token                        │
│  [Enter admin token___________]    │
│                                     │
│  Controller URL (optional)          │
│  [e.g., http://192.168.1.100:...]  │
│                                     │
│              [Confirm] [Cancel]     │
└─────────────────────────────────────┘
```

### Changes:
- Dialog title changed from "Admin Token" to "Admin Token & Controller"
- Added label "Admin Token" above the token input
- Added label "Controller URL (optional)" above new URL input
- New input field for Controller URL with helpful placeholder text
- Both fields maintain consistent styling with the rest of the app

## 2. Network Details Panel (New Display)

**When Controller URL is NOT configured:**
```
┌────────────────────────────────────────────────────┐
│  My Network Name                                   │
│  ID: a1b2c3d4e5f6g7h8                             │
│  IP: 192.168.195.10                                │
│  Status: Connected                                 │
└────────────────────────────────────────────────────┘
```

**When Controller URL IS configured:**
```
┌────────────────────────────────────────────────────┐
│  My Network Name                                   │
│  ID: a1b2c3d4e5f6g7h8                             │
│  IP: 192.168.195.10                                │
│  Status: Connected                                 │
│  Controller: http://192.168.195.50:3000/api/v1/   │
│              ^^^^ (click to copy)                  │
└────────────────────────────────────────────────────┘
```

### Changes:
- New line showing "Controller: [URL]" when a custom controller is configured
- Controller URL is styled with gray color for "Controller:" label
- URL itself is underlined and clickable to copy to clipboard
- Text overflow is handled with ellipsis for very long URLs
- Consistent styling with other info items (ID, IP)

## 3. Right-Click Context Menu (Unchanged)

The right-click menu remains the same, but now loading the dialog will:
- Pre-populate the Admin Token field with existing token (if any)
- Pre-populate the Controller URL field with existing URL (if any)
- Allow editing both values

## Interaction Flow

### Setting Up a Self-Hosted Controller:

1. User right-clicks a network → selects "Admin Token"
2. Dialog opens with two input fields
3. User enters:
   - Admin Token (required)
   - Controller URL (optional) - e.g., `http://192.168.195.10:3000/api/v1/`
4. User clicks "Confirm"
5. App validates token against the specified controller (or official if URL empty)
6. If successful:
   - Token and URL are saved to network config
   - Controller URL appears in network details panel
   - All admin operations now use the custom controller

### Viewing Controller Configuration:

1. User selects a network with custom controller
2. Network details panel shows the controller URL below status
3. User can click the URL to copy it to clipboard
4. Tooltip shows full URL if it's truncated

### Modifying Controller Configuration:

1. User right-clicks network → "Admin Token"
2. Dialog opens with pre-filled values
3. User can:
   - Update the token
   - Change the controller URL
   - Clear the controller URL (reverts to official API)
4. Click "Confirm" to save changes

## Visual Design Notes

- **Color Scheme**: Maintains existing app colors
  - Labels: Light gray (#8A8A8A)
  - Values: White (#FFFFFF)
  - Accents: Orange (#FDB25D)
  - Underlines: Dotted style for clickable items

- **Spacing**: Consistent 1rem spacing between input groups

- **Input Fields**:
  - Rounded borders (10px)
  - Transitions on focus (orange glow)
  - Placeholder text in lighter gray

- **Controller URL Display**:
  - Font size: 0.85rem (slightly smaller than other info)
  - Max width: 30rem with text-overflow ellipsis
  - Hover shows full URL in tooltip via title attribute

## Accessibility

- All inputs have visible labels
- Placeholder text provides examples
- Click-to-copy functionality with visual feedback
- Keyboard navigation supported in dialog
- Error messages (if any) are displayed clearly

## Responsive Design

- Dialog maintains fixed width
- Long URLs are truncated with ellipsis
- Layout adapts to content without breaking
