# CSS Structure Documentation

The CSS has been modularized into logical components for better maintainability. The structure is organized as follows:

## File Structure

```
src/styles/
├── index.css              # Main entry point - imports all modules
├── base.css               # Global resets and base styles
├── layout.css             # Layout and grid systems
├── header.css             # Header and navigation styles
├── buttons.css            # Button components
├── forms.css              # Form and input styles
├── cards.css              # Card and summary components
├── csv-import.css         # CSV import component
├── csv-table.css          # CSV table specific styles
├── transactions.css       # Transaction components
├── transaction-summary.css # Transaction summary styles
└── pages.css              # Page-specific layouts
```

## Module Descriptions

### `base.css`
- Global CSS resets
- Base HTML element styles
- Universal responsive styles for page containers

### `layout.css`
- App layout structure (.app, .app-main, .container)
- Grid systems and content layouts
- Container responsive behavior

### `header.css`
- App header styling
- Navigation tabs
- Header responsive design

### `buttons.css`
- All button variants (primary, danger, edit, save, cancel)
- Button hover and active states
- Button responsive styling

### `forms.css`
- Form groups and input styling
- Form validation states
- Edit forms and field groups

### `cards.css`
- Card components
- Summary items and grids
- Empty states

### `csv-import.css`
- CSV import component container
- Upload controls and file inputs
- Auto-save notifications
- Import actions and buttons

### `csv-table.css`
- CSV table container and table styles
- Table cells and validation states
- Error handling and status indicators

### `transactions.css`
- Transaction list items
- Transaction forms and type selectors
- Transaction metadata display

### `transaction-summary.css`
- Summary statistics components
- Monthly summaries
- Summary grid layouts

### `pages.css`
- Page-specific containers (transactions-page, stats-page, account-manager)
- Page headers and layouts

## Benefits of Modularization

1. **Maintainability**: Each component's styles are isolated and easy to find
2. **Reusability**: Components can be easily reused across different parts of the app
3. **Performance**: Only load styles that are needed
4. **Collaboration**: Multiple developers can work on different components without conflicts
5. **Debugging**: Easier to locate and fix styling issues

## Usage

The main `App.css` file now simply imports the modular structure:

```css
@import './styles/index.css';
```

All existing functionality is preserved while providing a much cleaner and more organized structure.

## Future Enhancements

Consider moving to:
- CSS Modules for scoped styling
- Styled Components for component-level styling
- CSS-in-JS solutions
- PostCSS for advanced processing
