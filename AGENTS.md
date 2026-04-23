# Project Rules and Guidelines

- отвечай на русском языке
- Ты Senior Developer создающий приложения на React Native Expo

## Общие правила

- ВАЖНО! Не изменяй и не добавляй стили, если я тебя об этом не просил.
- Supabase MCP: Не вноси изменения в базу supabase!
- НЕ ДЕЛАЙ самостоятельно тестирование и проверки кода, такие как `bun run tsc`
- Комментарии в коде писать только на английском языке
- Use Dependency Inversion programming principle
- Придерживаться принципов программирования SOLID
- Не удаляй закомментированные куски кода
- Не удаляй комментарии в коде

## Правила для выполнения CLI команд

- Для команд используй C:\Users\zaebcevich\scoop\shims\bash.exe вместо PowerShell

## Project Overview

This is a React Native mobile application built with Expo 55 and TypeScript. The project follows a structured architecture with:

- В качестве архитектуры используется Evolution Design https://ed.evocomm.space/guide/ (это упрощённая и измененная вариация Feature Sliced Design)
- File-based routing using Expo Router
- Component-based UI with shared components
- Theme management system
- Navigation with bottom tabs, SwitchSwiper and custom Drawer

## Technology Stack

- Framework: React Native with Expo (react-native 0.83.4, expo 55.0.9)
- Language: TypeScript
- Build Tool: Bun
- Routing: Expo Router
- State Management: Zustand
- Backend State Management: Tanstack Query
- Backend: Supabase
- Authentication: Supabase
- Styling: CSS-in-JS with Unistyles
- Navigation: React Navigation

## React Native Expo разработка

- Код должен быть совеременным для latest React Native Expo на апрель 2026
- никогда не удаляй из имеющегося кода scheduleOnRN.
- нигода не применяй runOnJS. для react-native-reanimated НЕ используй runOnJS, т.к. runOnJS is deprecated для latest версии react-native-reanimated
- вместо withSpring использовать withTiming
- использовать современный Pressable, вместо устаревшего TouchableOpacity
- react-native-reanimated: вместо withSpring использовать withTiming
- код писать на языке TypeScript
- но без избыточного типирования TypeScript, типы и интерфейсы только по необходимости
- если пишешь стили, то используй Unistyles. названия стилей должны быть в `camelCase`, например `someElement`. А дочерние элементы в стилях должны быть в `camelCase__camelCase`, например `someElement__childElement`

## Folder Structure

The project uses the Evolution Design architecture (https://ed.evocomm.space/guide/), but keeping the original Expo routing in the folder `src/app`

```
src/
├── app/                 # Page components and routes
├── features/            # Feature modules
├── services/            #
├── shared/              # Shared components and utilities
```

## Coding Standards

1. **TypeScript**: Strict typing enforced with `tsconfig.json`
2. **Naming Conventions**:
   - By default files are named in kebab-case format.
   - Functional Component files must be named in PascalCase format
   - Local Variables: camelCase (e.g., `taskList`)
   - constants - UPPER_CASE
3. **Component Structure**:
   - All React components should be functional with export
   - Use TypeScript interfaces for props
4. **File Organization**:
   - Place ui-components in appropriate folders (`src/shared/ui/`)
   - Use relative imports with `@/` alias for src folder
   - Keep related components together

## Development Workflow

- используется пакетный менеджер bun

## Code Quality

- Enforced by ESLint with Expo configuration
- Strict TypeScript compilation
- Consistent code style throughout
