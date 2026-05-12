'use client'
import { useState, useCallback, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import SearchBar from './SearchBar'
import FilterSidebar from './FilterSidebar'
import LabelsModal from './LabelsModal'
import RecipeGrid from './RecipeGrid'
import RecipeList from './RecipeList'
import ViewToggle from '@/components/ui/ViewToggle'
import type { RecipeCard, Tag, Category } from '@/types'

interface Props {
  initialRecipes: RecipeCard[]
  tags: Tag[]
  categories: Category[]
  initialSearch: string
  initialTags: string[]
  initialCategories: string[]
}

export default function CatalogPage({
  initialRecipes,
  tags,
  categories,
  initialSearch,
  initialTags,
  initialCategories,
}: Props) {
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

        // Update URL without navigation
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
    // Deselect any tags that were deleted
    const updatedIds = new Set(updatedTags.map((t) => t.id))
    setSelectedTags((prev) => {
      const next = prev.filter((id) => updatedIds.has(id))
      if (next.length !== prev.length) fetchRecipes(search, next, selectedCategories)
      return next
    })
  }, [fetchRecipes, search, selectedCategories])

  const handleCategoriesChange = useCallback((updatedCategories: Category[]) => {
    setCategoryList(updatedCategories)
    // Deselect any categories that were deleted
    const updatedIds = new Set(updatedCategories.map((c) => c.id))
    setSelectedCategories((prev) => {
      const next = prev.filter((id) => updatedIds.has(id))
      if (next.length !== prev.length) fetchRecipes(search, selectedTags, next)
      return next
    })
  }, [fetchRecipes, search, selectedTags])

  const activeFiltersCount = selectedTags.length + selectedCategories.length

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="border-b border-border bg-cream/80 backdrop-blur-sm sticky top-0 z-10 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <h1 className="font-serif text-2xl font-bold text-ink tracking-tight">
            Recipe Catalog
          </h1>
          <div className="flex items-center gap-3">
            <a href="/admin/import" className="btn-secondary text-sm hidden sm:inline-flex">
              Import photos
            </a>
            <a href="/admin/add" className="btn-primary text-sm hidden sm:inline-flex">
              + Add recipe
            </a>
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
                <button onClick={handleClear} className="tag-pill text-terracotta border-terracotta/30">
                  Clear {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''}
                </button>
              )}
            </div>

            {/* Result count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-ink-muted">
                {loading ? 'Loading…' : `${recipes.length} recipe${recipes.length !== 1 ? 's' : ''}`}
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
      <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-cream/95 backdrop-blur-sm border-t border-border p-3 flex gap-2 no-print z-10">
        <a href="/admin/import" className="btn-secondary flex-1 text-center text-sm py-3">
          Import photos
        </a>
        <a href="/admin/add" className="btn-primary flex-1 text-center text-sm py-3">
          + Add recipe
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
    </div>
  )
}
