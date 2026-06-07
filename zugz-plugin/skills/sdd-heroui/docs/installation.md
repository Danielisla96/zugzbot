# Installation

Copy MarkdownSet up HeroUI Pro in your project

## Requirements




- React 19+

- Tailwind CSS v4

- HeroUI OSS (`@heroui/react` + `@heroui/styles`)

If you haven't set up HeroUI OSS yet, follow the HeroUI Quick Start first.


## Login


Run the HeroUI Pro CLI and log in with your GitHub account:

npxbunxpnpm

```tsx
npx heroui-pro@latest login
```

```tsx
bunx heroui-pro@latest login
```

```tsx
pnpm dlx heroui-pro@latest login
```

A browser tab will open automatically. Sign in with your GitHub account, authorize the application, and wait for the terminal to confirm:



```tsx
Logged in as @your-username
```


## Install

Once logged in, run:

npxbunxpnpm

```tsx
npx heroui-pro@latest install
```

```tsx
bunx heroui-pro@latest install
```

```tsx
pnpm dlx heroui-pro@latest install
```

The CLI handles everything automatically:



- Adds `@heroui-pro/react` to your project (if not already present)

- Downloads Pro components from the CDN using your license

- Detects missing peer dependencies and installs them with the correct version ranges

- Configures your package manager — for pnpm and bun, offers to allowlist the postinstall script so future installs work seamlessly


You'll see an interactive prompt to confirm which peer dependencies to install. Press Enter to install all of them:



```tsx
◆  14 missing peer dependencies detected. Press Enter to install all, or uncheck to skip:
│  ↑↓ move, space select, enter confirm
│  ◼ @heroui/react (>=3.0.0)
│  ◼ @heroui/styles (>=3.0.0)
│  ◼ tailwindcss (>=4.0.0)
│  ...
```

After installation completes you'll see:



```tsx
└  ✓ HeroUI React Pro v1.0.0-alpha.8 installed successfully.
```

You can also use the interactive menu by running `npx heroui-pro` with no arguments. It provides a guided flow for login, installation, and account management.


## Import Styles


Add HeroUI Pro styles to your main CSS file (e.g. `globals.css`):


globals.css
```tsx
@import "tailwindcss";
@import "@heroui/styles";
@import "@heroui-pro/react/css"; 
```

Import order matters. Always import `tailwindcss` first, then `@heroui/styles`, then `@heroui-pro/react/css`.


## Use a Pro Component



```tsx
import { Command } from '@heroui-pro/react';

function App() {
  return (
    <Command>
      <Command.Backdrop />
      <Command.Container>
        <Command.Dialog>
          <Command.InputGroup>
            <Command.InputGroup.Input placeholder="Type a command..." />
          </Command.InputGroup>
          <Command.List>
            <Command.Item id="profile">Profile</Command.Item>
            <Command.Item id="settings">Settings</Command.Item>
            <Command.Item id="logout">Logout</Command.Item>
          </Command.List>
        </Command.Dialog>
      </Command.Container>
    </Command>
  );
}
```


## CLI Reference

CommandDescription`heroui-pro login`Log in with GitHub`heroui-pro install`Install Pro packages, peer deps, and configure your PM`heroui-pro install --yes`Non-interactive install (auto-accept all prompts)`heroui-pro install --dry-run`Preview what would be installed without executing`heroui-pro status`Show login and installed package info`heroui-pro logout`Sign out

## CI/CD

For automated environments (GitHub Actions, Vercel, Netlify, etc.), use a CI/CD token instead of interactive login. Get your token from the dashboard.


Set the `HEROUI_AUTH_TOKEN` environment variable in your CI pipeline:

GitHub ActionsVercelNetlifyGeneral
Add `HEROUI_AUTH_TOKEN` as a repository secret, then reference it in your workflow:

.github/workflows/deploy.yml
```tsx
env:
  HEROUI_AUTH_TOKEN: ${{ secrets.HEROUI_AUTH_TOKEN }}
```
Add `HEROUI_AUTH_TOKEN` in your project's Environment Variables settings.

Add `HEROUI_AUTH_TOKEN` in Site settings → Environment variables.


```tsx
export HEROUI_AUTH_TOKEN=your-cicd-token
npm install
```

When `HEROUI_AUTH_TOKEN` is set, the postinstall script automatically authenticates and downloads Pro artifacts — no interactive login needed. This works with all package managers.


Use your CI/CD token for pipelines, not your personal token. CI/CD tokens are scoped to your license and can be rotated independently from the dashboard.


## Verify Installation


After installation, verify everything is working:



- Check that your app starts without errors

- Try importing and using a Pro component like `Command` or `Sheet`

- Run the CLI to check your status:



```tsx
npx heroui-pro status
```


## Troubleshooting

Installation fails with permission errors


Try running the CLI with elevated permissions or check that your package manager has write access to `node_modules`.


pnpm or bun: postinstall didn't run


The CLI handles this automatically — `heroui-pro install` downloads artifacts directly and offers to configure your `package.json` so future installs work natively. If you prefer to configure it manually:



- bun: add `"trustedDependencies": ["heroui-pro", "@heroui-pro/react"]` to `package.json`

- pnpm: add `"pnpm": { "onlyBuiltDependencies": ["heroui-pro", "@heroui-pro/react"] }` to `package.json`


Yarn Berry (PnP) not supported


HeroUI Pro requires `node_modules`. If using Yarn Berry, add `nodeLinker: node-modules` to your `.yarnrc.yml`.


Authentication expired


Run `npx heroui-pro login` to re-authenticate. Sessions are valid for 180 days.



Still having issues? Contact support@heroui.pro or reach out via live chat at heroui.pro/dashboard.


## What's Next?




- Browse Components — See all available Pro components

- Theme Builder — Create and share your own themes

- Colors — Understand the color system

- Pro UI for Agents — Set up AI tools for HeroUI Pro
Introduction

Premium composable components that extend HeroUI — built for teams who want to ship beautiful, production-ready apps fast.

Licensing

How HeroUI Pro licensing, perpetual access, renewals, and v2 upgrades work