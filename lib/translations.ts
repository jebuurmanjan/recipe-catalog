export type Locale = 'en' | 'nl'

export type TranslationKey =
  | 'recipeCatalog'
  | 'importPhotos'
  | 'addRecipe'
  | 'loading'
  | 'recipeCount'
  | 'clearFilters'
  | 'enterPasswordPrompt'
  | 'password'
  | 'enterPassword'
  | 'checking'
  | 'enter'
  | 'incorrectPassword'
  | 'somethingWentWrong'
  | 'backToCatalog'
  | 'settings'
  | 'language'
  | 'theme'
  | 'light'
  | 'dark'

export type Translations = Record<TranslationKey, string>

const en: Translations = {
  recipeCatalog:       'Recipe Catalog',
  importPhotos:        'Import photos',
  addRecipe:           '+ Add recipe',
  loading:             'Loading…',
  recipeCount:         '{n} recipe(s)',
  clearFilters:        'Clear {n} filter(s)',
  enterPasswordPrompt: 'Enter your password to continue',
  password:            'Password',
  enterPassword:       'Enter password',
  checking:            'Checking…',
  enter:               'Enter',
  incorrectPassword:   'Incorrect password',
  somethingWentWrong:  'Something went wrong. Please try again.',
  backToCatalog:       '← Back to catalog',
  settings:            'Settings',
  language:            'Language',
  theme:               'Theme',
  light:               'Light',
  dark:                'Dark',
}

const nl: Translations = {
  recipeCatalog:       'Receptenboek',
  importPhotos:        "Foto's importeren",
  addRecipe:           '+ Recept toevoegen',
  loading:             'Laden…',
  recipeCount:         '{n} recepten',
  clearFilters:        '{n} filter(s) wissen',
  enterPasswordPrompt: 'Voer je wachtwoord in',
  password:            'Wachtwoord',
  enterPassword:       'Wachtwoord invoeren',
  checking:            'Controleren…',
  enter:               'Inloggen',
  incorrectPassword:   'Onjuist wachtwoord',
  somethingWentWrong:  'Er ging iets mis. Probeer opnieuw.',
  backToCatalog:       '← Terug naar catalogus',
  settings:            'Instellingen',
  language:            'Taal',
  theme:               'Weergave',
  light:               'Licht',
  dark:                'Donker',
}

export const dict: Record<Locale, Translations> = { en, nl }

export function translate(
  locale: Locale,
  key: TranslationKey,
  subs?: Record<string, string | number>
): string {
  let str = dict[locale][key]
  if (subs) {
    for (const [k, v] of Object.entries(subs)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
    }
  }
  return str
}
