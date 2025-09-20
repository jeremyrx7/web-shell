// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/en'
  },
  useParams() {
    return { locale: 'en' }
  },
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key) => key,
  useLocale: () => 'en',
  useMessages: () => ({}),
}))

// Mock next-intl/server
jest.mock('next-intl/server', () => ({
  getMessages: async () => ({}),
  getTranslations: async () => (key) => key,
}))

// Mock @heroicons/react
jest.mock('@heroicons/react/24/outline', () => ({
  PlusIcon: 'PlusIcon',
  TrashIcon: 'TrashIcon',
  Cog6ToothIcon: 'Cog6ToothIcon',
  EyeIcon: 'EyeIcon',
  EyeSlashIcon: 'EyeSlashIcon',
  ArrowsUpDownIcon: 'ArrowsUpDownIcon',
  HomeIcon: 'HomeIcon',
  PuzzlePieceIcon: 'PuzzlePieceIcon',
  ChartBarIcon: 'ChartBarIcon',
  DocumentTextIcon: 'DocumentTextIcon',
  UserGroupIcon: 'UserGroupIcon',
  ExclamationTriangleIcon: 'ExclamationTriangleIcon',
  ArrowPathIcon: 'ArrowPathIcon',
  ChevronDownIcon: 'ChevronDownIcon',
  GlobeAltIcon: 'GlobeAltIcon',
  CubeIcon: 'CubeIcon',
  SparklesIcon: 'SparklesIcon',
  ArrowRightIcon: 'ArrowRightIcon',
}))

jest.mock('@heroicons/react/24/solid', () => ({
  HomeIcon: 'HomeIconSolid',
  PuzzlePieceIcon: 'PuzzlePieceIconSolid',
  ChartBarIcon: 'ChartBarIconSolid',
  DocumentTextIcon: 'DocumentTextIconSolid',
  UserGroupIcon: 'UserGroupIconSolid',
  CogIcon: 'CogIconSolid',
}))

// Mock @dnd-kit
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }) => children,
  useSensor: () => {},
  useSensors: () => [],
  PointerSensor: {},
  KeyboardSensor: {},
  closestCenter: {},
}))

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }) => children,
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: null,
    isDragging: false,
  }),
  sortableKeyboardCoordinates: {},
  verticalListSortingStrategy: {},
  arrayMove: (array, from, to) => {
    const result = [...array]
    const [removed] = result.splice(from, 1)
    result.splice(to, 0, removed)
    return result
  },
}))

jest.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => '',
    },
  },
}))

// Mock window.ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Suppress console warnings during tests
const originalWarn = console.warn
beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.warn = originalWarn
})
