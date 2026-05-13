# Project Rules and Guidelines

- отвечай на русском языке
- сообщения git коммитов генерируй на русском языке, но названия файлов/папок/функций/переменных пиши на английском в сообщениях коммитов
- Ты Senior Developer создающий приложения на React Native Expo

## Общие правила

- ВАЖНО! Не изменяй и не добавляй стили, если я тебя об этом не просил.
- Database: op-sqlite + drizzle-orm (local storage)
- НЕ ДЕЛАЙ самостоятельно тестирование и проверки кода, такие как `bun run tsc`
- Комментарии в коде писать только на английском языке
- Use Dependency Inversion programming principle
- Придерживаться принципов программирования SOLID
- Не удаляй закомментированные куски кода
- Не удаляй комментарии в коде
- не сокращать слова в названиях переменных и свойств объектов
- не используй require, для импорта только import
- если импортируешь только типы, то используй слово type `import type { ... } from '...'`

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
- Local Storage: react-native-mmkv
- Backend: Supabase
- Backend State Management: Tanstack Query
- Authentication: None (local app), но в дальнейшем планируется использование Supabase
- Styling: CSS-in-JS with Unistyles
- Navigation: React Navigation
- React Native Skia для canvas графики

## Components and deps

### BottomSheet

@lodev09/react-native-true-sheet [Migrating to v3](https://sheet.lodev09.com/migration)

## React Native Expo разработка

- Код должен быть совеременным для latest React Native Expo на апрель 2026
- никогда не удаляй из имеющегося кода scheduleOnRN.
- нигода не применяй runOnJS. для react-native-reanimated НЕ используй runOnJS, т.к. runOnJS is deprecated для latest версии react-native-reanimated
- вместо withSpring использовать withTiming
- не используй useScrollViewOffset. 'useScrollViewOffset' is deprecated
- использовать современный Pressable, вместо устаревшего TouchableOpacity
- react-native-reanimated: вместо withSpring использовать withTiming
- код писать на языке TypeScript
- но без избыточного типирования TypeScript, типы и интерфейсы только по необходимости
- если пишешь стили, то используй Unistyles. названия стилей должны быть в `PascalCase`, например `SomeElement`. А дочерние элементы в стилях должны быть в `PascalCase__camelCase`, например `SomeElement__childElement`. Модификаторы `_modificatorName`

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

## React Native Skia для canvas графики

- Unsupported APIs для React Native Web: PathEffectFactory.MakeSum(), PathEffectFactory.MakeCompose(), PathFactory.MakeFromText(), ShaderFilter. Остальные работают отлично.
