'use client'
import { useState, useCallback, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import SearchBar from './SearchBar'
import FilterSidebar from './FilterSidebar'
import LabelsModal from './LabelsModal'
import RecipeGrid from './RecipeGrid'
import RecipeList from './RecipeList'
import ViewToggle from '@/components/ui/ViewToggle'
import SettingsModal from '@/components/ui/SettingsModal'
import { useLanguage } from '@/contexts/LanguageContext'
import type { RecipeCard, Tag, Category } from '@/types'

interface Props {
  initialRecipes: RecipeCard[]
  tags: Tag[]
  categories: Category[]
  initialSearch: string
  initialTags: string[]
  initialCategories: string[]
}

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

export default function CatalogPage({
  initialRecipes,
  tags,
  categories,
  initialSearch,
  initialTags,
  initialCategories,
}: Props) {
  const { t } = useLanguage()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState(initialSearch)
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories)
  const [recipes, setRecipes] = useState<RecipeCard[]>(initialRecipes)
  const [loading, setLoading] = useState(false)
  const [, startTransition] = useTransition()
  const [tagList, setTagList] = useState<Tag[]>(tags)
  const [categoryList, setCategoryList] = useState<Category[]>(categories)
  const [labelsModalOpen, setLabelsModalOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const fetchRecipes = useCallback(
    async (q: string, tags: string[], cats: string[]) => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (q) params.set('q', q)
        tags.forEach((t) => params.append('tag', t))
        cats.forEach((c) => params.append('category', c))

        const res = await fetch(`/api/recipes?${params.toString()}`)
        const data = await res.json()
        setRecipes(data.recipes ?? [])

        startTransition(() => {
          router.push(`${pathname}?${params.toString()}`, { scroll: false })
        })
      } finally {
        setLoading(false)
      }
    },
    [router, pathname]
  )

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value)
      fetchRecipes(value, selectedTags, selectedCategories)
    },
    [fetchRecipes, selectedTags, selectedCategories]
  )

  const handleTagToggle = useCallback(
    (id: string) => {
      const next = selectedTags.includes(id)
        ? selectedTags.filter((t) => t !== id)
        : [...selectedTags, id]
      setSelectedTags(next)
      fetchRecipes(search, next, selectedCategories)
    },
    [fetchRecipes, search, selectedTags, selectedCategories]
  )

  const handleCategoryToggle = useCallback(
    (id: string) => {
      const next = selectedCategories.includes(id)
        ? selectedCategories.filter((c) => c !== id)
        : [...selectedCategories, id]
      setSelectedCategories(next)
      fetchRecipes(search, selectedTags, next)
    },
    [fetchRecipes, search, selectedTags, selectedCategories]
  )

  const handleClear = useCallback(() => {
    setSelectedTags([])
    setSelectedCategories([])
    setSearch('')
    fetchRecipes('', [], [])
  }, [fetchRecipes])

  const handleTagsChange = useCallback((updatedTags: Tag[]) => {
    setTagList(updatedTags)
    const updatedIds = new Set(updatedTags.map((t) => t.id))
    setSelectedTags((prev) => {
      const next = prev.filter((id) => updatedIds.has(id))
      if (next.length !== prev.length) fetchRecipes(search, next, selectedCategories)
      return next
    })
  }, [fetchRecipes, search, selectedCategories])

  const handleCategoriesChange = useCallback((updatedCategories: Category[]) => {
    setCategoryList(updatedCategories)
    const updatedIds = new Set(updatedCategories.map((c) => c.id))
    setSelectedCategories((prev) => {
      const next = prev.filter((id) => updatedIds.has(id))
      if (next.length !== prev.length) fetchRecipes(search, selectedTags, next)
      return next
    })
  }, [fetchRecipes, search, selectedTags])

  const activeFiltersCount = selectedTags.length + selectedCategories.length

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Header */}
      <header
        className="border-b sticky top-0 z-10 no-print backdrop-blur-sm"
        style={{ borderColor: 'var(--border)', backgroundColor: 'color-mix(in srgb, var(--bg-base) 80%, transparent)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {t('recipeCatalog')}
          </h1>
          <div className="flex items-center gap-3">
            <a href="/admin/import" className="btn-secondary text-sm hidden sm:inline-flex">
              {t('importPhotos')}
            </a>
            <a href="/admin/add" className="btn-primary text-sm hidden sm:inline-flex">
              {t('addRecipe')}
            </a>
            <button
              onClick={() => setSettingsOpen(true)}
              className="btn-ghost p-2"
              aria-label={t('settings')}
            >
              <GearIcon />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8">
        {/* Search + view toggle row */}
        <div className="flex items-center gap-3 mb-8 no-print">
          <div className="flex-1">
            <SearchBar value={search} onChange={handleSearch} />
          </div>
          <ViewToggle view={view} onChange={setView} />
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block w-52 flex-shrink-0 no-print">
            <FilterSidebar
              tags={tagList}
              categories={categoryList}
              selectedTags={selectedTags}
              selectedCategories={selectedCategories}
              onTagToggle={handleTagToggle}
              onCategoryToggle={handleCategoryToggle}
              onClear={handleClear}
              onEditLabels={() => setLabelsModalOpen(true)}
            />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter bar */}
            <div className="flex flex-wrap gap-2 mb-4 lg:hidden no-print">
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClear}
                  className="tag-pill"
                  style={{ color: 'var(--accent)', borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)' }}
                >
                  {t('clearFilters', { n: activeFiltersCount })}
                </button>
              )}
            </div>

            {/* Result count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {loading
                  ? t('loading')
                  : t('recipeCount', { n: recipes.length })}
              </p>
            </div>

            {/* Recipe grid/list */}
            <div className={`transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              {view === 'grid' ? (
                <RecipeGrid recipes={recipes} />
              ) : (
                <RecipeList recipes={recipes} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div
        className="fixed bottom-0 left-0 right-0 sm:hidden border-t p-3 flex gap-2 no-print z-10 backdrop-blur-sm"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'color-mix(in srgb, var(--bg-base) 95%, transparent)',
        }}
      >
        <a href="/admin/import" className="btn-secondary flex-1 text-center text-sm py-3">
          {t('importPhotos')}
        </a>
        <a href="/admin/add" className="btn-primary flex-1 text-center text-sm py-3">
          {t('addRecipe')}
        </a>
      </div>

      {labelsModalOpen && (
        <LabelsModal
          tags={tagList}
          categories={categoryList}
          onClose={() => setLabelsModalOpen(false)}
          onTagsChange={handleTagsChange}
          onCategoriesChange={handleCategoriesChange}
        />
      )}

      {settingsOpen && (
        <SettingsModal onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  )
}
