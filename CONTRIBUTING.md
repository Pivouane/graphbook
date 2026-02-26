# Contributing to Graphbook

## Writing a Module

Modules are the building blocks of Graphbook profiles. Every visual element on a profile page from the sidebar, the post wall, to any custom feature is a module. If you want to add something to a user's profile, you write a module.

### What is a module?

A module is a React component that receives a `ModuleContext` (information about the profile being viewed and the logged-in user) and renders whatever it wants on the page. It positions itself within the profile container, so it fully controls where and how it appears.

Modules live in `src/modules/<my-module-slug>/`.

---

### Module structure

```
src/modules/my-module/
├── manifest.json   ← metadata and default args
└── index.tsx       ← React entry point (required)
```

You can add as many additional files as you need (sub-components, helpers, styles, etc.) inside your module folder.

---

### manifest.json

The manifest describes your module and provides its default configuration.

```json
{
  "slug": "my-module",
  "name": "My Module Name",
  "description": "A short description of what my module does.",
  "default": false,
  "args": {
    "anyArgName": "anyValue",
  }
}
```

| Field | Type | Description |
|---|---|---|
| `slug` | `string` | Unique identifier, must match the folder name |
| `name` | `string` | Display name shown in the settings UI |
| `description` | `string` | Short description shown in the settings UI |
| `default` | `boolean` | If `true`, the module is active for all users without them having to enable it |
| `args` | `object` | Default arguments passed to your component. Users can override these from their settings. |

#### Validating arguments

If you wish to allow users to customize the position and size of your module, you can define `margin`, `height`, and `width` args in your manifest but make sure to validate them in your component and only allow specific Tailwind utility classes. For example:

```json
  "args": {
    "height": "h-32",  // or any other fixed height
  }
```

These args will be passed to your component, and you *should* validate them to ensure users don't break or abuse the layout. For example, only allow predefined values for `position` and only allow certain Tailwind classes for `height` and `width`.

```ts
export default function mySuperModule({ height }) {
  
  if (!(height && /^h-(\d+|full)$/.test(height))) {
    height = ""; // fallback to default 
    return <p>Invalid height value</p>; // or show an error message
  }

  return <div className={`absolute ${height}`}>...</div>;
}
```

---

### index.tsx

Your component receives a `ModuleContext` and any args defined in your manifest as props.

```tsx
import type { ModuleContext } from "@/modules/types";

interface Props {
  context: ModuleContext;
}

export default function mySuperModule({ context }: Props) {
  const { profileUser, currentSession } = context;

  return (
    <div>
      <p>Hello, {profileUser.name}!</p>
    </div>
  );
}
```

#### ModuleContext

```ts
interface ModuleContext {
  profileUser: ModuleUser;              // the user whose profile is being viewed
  currentSession: ModuleSession;        // the currently logged-in user's session
}

interface ModuleUser {
  id: string;
  name: string;
  username: string | null;
  imageURL: string | null;
  quote: string | null;
  promo: string | null;
  activeModules: ModulePayload[];       // list of active modules with their args
  favoriteIDs: string[];
}

interface ModulePayload {
  slug: string;                         // module slug
  args: Record<string, unknown> | null; // user-defined args for this module
}
```

---

### Security guidelines

Modules are reviewed by maintainers before being merged. However, please follow these rules to keep the platform safe:

- **Do not pass any raw CSS or HTML through module args** that could lead to XSS vulnerabilities, only allow predefined Tailwind classes or specific values for args that affect styling or layout
- **Do not access or display other users' private data** beyond what is provided in `ModuleContext`

Modules that violate these guidelines will be rejected.

---

### Submitting your module

1. Create a branch: `git checkout -b my-pet-name/my-module-slug`
2. Add your module in `src/modules/my-module-slug/`
4. Run the checks: `npm run check`
5. Open a pull request with a description of what your module does and a screenshot or demo, if possible
6. Tag a maintainer for review

That's it! Thanks for contributing to Graphbook. I can't wait to see what you build. :)
