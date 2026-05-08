# @tutor-sg/theme — Kid-friendly design token system

Design tokens + React `ThemeProvider` for the tutor-sg app.

## Package contents

```
packages/theme/src/
├── index.ts              # Barrel exports
├── types.ts              # Theme, ThemeMode, ThemeContextValue types
├── ThemeProvider.tsx      # React context provider
├── useTheme.ts           # Hook to access theme
├── tokens/
│   ├── index.ts          # Token barrel
│   ├── colors.ts         # Palette + kidColors + parentColors
│   ├── typography.ts     # Font sizes, weights, line heights, presets
│   ├── spacing.ts        # 8-pt grid spacing + content insets + touch targets
│   ├── borders.ts        # Border radius + width
│   └── shadows.ts        # Platform-aware shadow presets
└── __tests__/
    ├── ThemeProvider.vitest.tsx         # Provider, hook, token integrity tests
    ├── design-token-values.vitest.tsx   # Value consistency & hierarchy tests
    └── setup.ts           # React Native mocks for test runner
```

## Usage

### 1. Wrap your app

```tsx
import { ThemeProvider } from '@tutor-sg/theme';

export default function App() {
  return (
    <ThemeProvider initialMode="kid">
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

### 2. Use theme in components

```tsx
import { useTheme } from '@tutor-sg/theme';
import { View, Text, StyleSheet } from 'react-native';

function MyScreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
        Hello!
      </Text>
    </View>
  );
}
```

### 3. Switch modes

```tsx
const { theme, setMode, mode } = useTheme();

// Switch to parent dashboard mode
setMode('parent');
```

## Design tokens

| Token group | Description |
|---|---|
| `palette` | Raw color values (50–900 scale per hue) |
| `kidColors` | Vibrant, playful palette for kid-facing UI |
| `parentColors` | Professional, calm palette for parent dashboard |
| `typography` | Composable `TextStyle` presets (body, h1, caption, etc.) |
| `spacing` | 8-pt grid (2–48px) |
| `contentInset` | Pre-computed padding objects for cards, buttons, pages |
| `touchTarget` | Minimum 44pt interactive targets |
| `borderRadius` | Generous rounding (4px → full circle) |
| `borderWidth` | Hairline → thick (focus ring) |
| `shadows` | Platform-aware elevation/shadow presets |

## Kid mode colors (vibrant)

- **Primary:** Blue (`#1E88E5`)
- **Secondary:** Coral (`#FF8A65`)
- **Success/Correct:** Green (`#4CAF50`)
- **Error/Wrong:** Red (`#F44336`)
- **Body text:** `#212121` on `#FAFAFA` background (WCAG AA+)
- **Subject accent colors:** Math (blue), English (coral), Chinese (green), Science (purple)

## Parent mode colors (professional)

- **Primary:** Darker blue (`#1976D2`)
- **Chart-ready accent palette** for data visualisation

## Accessibility (ADD §9)

- Body text: **17pt** (exceeds 16pt min)
- Touch targets: **44pt minimum**
- High contrast text on all color pairs (WCAG AA)
- All interactive elements have focus ring styles (`borderWidth.thick`)
