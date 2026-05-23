'use client'
import { useState, useCallback, useTransition, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import SearchBar from './SearchBar'
import FilterSidebar from './FilterSidebar'
import CollectionsSidebar from './CollectionsSidebar'
import CollectionView from './CollectionView'
import MobileFilterModal from './MobileFilterModal'
import LabelsModal from './LabelsModal'
import AddToCollectionModal from './AddToCollectionModal'
import AddRecipesModal from './AddRecipesModal'
import RecipeGrid from './RecipeGrid'
import RecipeList from './RecipeList'
import ViewToggle from '@/components/ui/ViewToggle'
import SettingsModal from '@/components/ui/SettingsModal'
import { useLanguage } from '@/contexts/LanguageContext'
import type { RecipeCard, Tag, Category, Collection } from '@/types'

interface Props {
  initialRecipes: RecipeCard[]
  tags: Tag[]
  categories: Category[]
  initialSearch: string
  initialTags: string[]
  initialCategories: string[]
  userEmail: string
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
  userEmail,
}: Props) {
  const { t } = useLanguage()

  // ── Catalog state ──────────────────────────────────────────────────────────
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState(initialSearch)
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories)
  const [recipes, setRecipes] = useState<RecipeCard[]>(initialRecipes)
  const [loading, setLoading] = useState(false)
  const [, startTransition] = useTransition()
  const [tagList, setTagList] = useState<Tag[]>(tags)
  const [categoryList, setCategoryList] = useState<Category[]>(categories)
  const [showConcepts, setShowConcepts] = useState(false)

  // ── UI modals ──────────────────────────────────────────────────────────────
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [labelsModalOpen, setLabelsModalOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // ── Sidebar tab ────────────────────────────────────────────────────────────
  const [sidebarTab, setSidebarTab] = useState<'filters' | 'collections'>('filters')

  // ── Collections ────────────────────────────────────────────────────────────
  const [collections, setCollections] = useState<Collection[]>([])
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null)
  const [collectionRecipes, setCollectionRecipes] = useState<RecipeCard[]>([])

  // ── Context menu modals ────────────────────────────────────────────────────
  /** Recipe for "Add to collection" modal (from catalog card ...) */
  const [addToCollRecipe, setAddToCollRecipe] = useState<RecipeCard | null>(null)
  /** Collection-member IDs for the selected recipe */
  const [addToCollMemberIds, setAddToCollMemberIds] = useState<string[]>([])
  /** Whether "Add recipes to active collection" modal is open */
  const [addRecipesModalOpen, setAddRecipesModalOpen] = useState(false)

  const router = useRouter()
  const pathname = usePathname()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  // ── Load collections on mount ──────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/collections')
      .then((r) => r.json())
      .then((d) => setCollections(d.collections ?? []))
      .catch(() => {})
  }, [])

  // ── Load active collection recipes ────────────────────────────────────────
  useEffect(() => {
    if (!activeCollectionId) return
    fetch(`/api/collections/${activeCollectionId}/recipes`)
      .then((r) => r.json())
      .then((d) => setCollectionRecipes(d.recipes ?? []))
      .catch(() => {})
  }, [activeCollectionId])

  // ── Fetch catalog recipes ─────────────────────────────────────────────────
  const fetchRecipes = useCallback(
    async (q: string, tags: string[], cats: string[], concepts: boolean) => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (q) params.set('q', q)
        tags.forEach((t) => params.append('tag', t))
        cats.forEach((c) => params.append('category', c))
        if (concepts) params.set('concepts', 'true')

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
      fetchRecipes(value, selectedTags, selectedCategories, showConcepts)
    },
    [fetchRecipes, selectedTags, selectedCategories, showConcepts]
  )

  const handleTagToggle = useCallback(
    (id: string) => {
      const next = selectedTags.includes(id)
        ? selectedTags.filter((t) => t !== id)
        : [...selectedTags, id]
      setSelectedTags(next)
      fetchRecipes(search, next, selectedCategories, showConcepts)
    },
    [fetchRecipes, search, selectedTags, selectedCategories, showConcepts]
  )

  const handleCategoryToggle = useCallback(
    (id: string) => {
      const next = selectedCategories.includes(id)
        ? selectedCategories.filter((c) => c !== id)
        : [...selectedCategories, id]
      setSelectedCategories(next)
      fetchRecipes(search, selectedTags, next, showConcepts)
    },
    [fetchRecipes, search, selectedTags, selectedCategories, showConcepts]
  )

  const handleClear = useCallback(() => {
    setSelectedTags([])
    setSelectedCategories([])
    setSearch('')
    fetchRecipes('', [], [], showConcepts)
  }, [fetchRecipes, showConcepts])

  const handleShowConceptsToggle = useCallback(() => {
    const next = !showConcepts
    setShowConcepts(next)
    fetchRecipes(search, selectedTags, selectedCategories, next)
  }, [fetchRecipes, search, selectedTags, selectedCategories, showConcepts])

  const handleTagsChange = useCallback((updatedTags: Tag[]) => {
    setTagList(updatedTags)
    const updatedIds = new Set(updatedTags.map((t) => t.id))
    setSelectedTags((prev) => {
      const next = prev.filter((id) => updatedIds.has(id))
      if (next.length !== prev.length) fetchRecipes(search, next, selectedCategories, showConcepts)
      return next
    })
  }, [fetchRecipes, search, selectedCategories, showConcepts])

  const handleCategoriesChange = useCallback((updatedCategories: Category[]) => {
    setCategoryList(updatedCategories)
    const updatedIds = new Set(updatedCategories.map((c) => c.id))
    setSelectedCategories((prev) => {
      const next = prev.filter((id) => updatedIds.has(id))
      if (next.length !== prev.length) fetchRecipes(search, selectedTags, next, showConcepts)
      return next
    })
  }, [fetchRecipes, search, selectedTags, showConcepts])

  // ── Collection CRUD ───────────────────────────────────────────────────────
  const handleCreateCollection = useCallback(async (name: string) => {
    const res = await fetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const data = await res.json()
    if (data.collection) {
      setCollections((prev) => [...prev, data.collection])
    }
  }, [])

  const handleSelectCollection = useCallback((id: string) => {
    setActiveCollectionId(id)
  }, [])

  const handleCloseCollection = useCallback(() => {
    setActiveCollectionId(null)
    setCollectionRecipes([])
  }, [])

  const handleRenameCollection = useCallback(async (name: string) => {
    if (!activeCollectionId) return
    const res = await fetch(`/api/collections/${activeCollectionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const data = await res.json()
    if (data.collection) {
      setCollections((prev) => prev.map((c) => c.id === activeCollectionId ? { ...c, name: data.collection.name } : c))
    }
  }, [activeCollectionId])

  const handleDeleteCollection = useCallback(async () => {
    if (!activeCollectionId) return
    await fetch(`/api/collections/${activeCollectionId}`, { method: 'DELETE' })
    setCollections((prev) => prev.filter((c) => c.id !== activeCollectionId))
    setActiveCollectionId(null)
    setCollectionRecipes([])
  }, [activeCollectionId])

  const handleRemoveFromCollection = useCallback(async (recipeId: string) => {
    if (!activeCollectionId) return
    await fetch(`/api/collections/${activeCollectionId}/recipes`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipe_id: recipeId }),
    })
    setCollectionRecipes((prev) => prev.filter((r) => r.id !== recipeId))
    setCollections((prev) => prev.map((c) =>
      c.id === activeCollectionId ? { ...c, recipe_count: Math.max(0, (c.recipe_count ?? 1) - 1) } : c
    ))
  }, [activeCollectionId])

  const handleReorderCollection = useCallback(async (orderedIds: string[]) => {
    if (!activeCollectionId) return
    await fetch(`/api/collections/${activeCollectionId}/recipes/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: orderedIds }),
    })
  }, [activeCollectionId])

  // ── Add recipes to collection (from collection view) ──────────────────────
  const handleAddRecipeToggle = useCallback(async (recipe: RecipeCard, isMember: boolean) => {
    if (!activeCollectionId) return
    if (isMember) {
      await fetch(`/api/collections/${activeCollectionId}/recipes`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe_id: recipe.id }),
      })
      setCollectionRecipes((prev) => prev.filter((r) => r.id !== recipe.id))
      setCollections((prev) => prev.map((c) =>
        c.id === activeCollectionId ? { ...c, recipe_count: Math.max(0, (c.recipe_count ?? 1) - 1) } : c
      ))
    } else {
      await fetch(`/api/collections/${activeCollectionId}/recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe_id: recipe.id }),
      })
      setCollectionRecipes((prev) => [...prev, recipe])
      setCollections((prev) => prev.map((c) =>
        c.id === activeCollectionId ? { ...c, recipe_count: (c.recipe_count ?? 0) + 1 } : c
      ))
    }
  }, [activeCollectionId])

  // ── Add to collection (from catalog card ...) ─────────────────────────────
  const handleOpenAddToCollection = useCallback(async (recipe: RecipeCard) => {
    // Find which collections this recipe is already in
    const results = await Promise.all(
      collections.map(async (col) => {
        const res = await fetch(`/api/collections/${col.id}/recipes`)
        const data = await res.json()
        const ids: string[] = (data.recipes ?? []).map((r: RecipeCard) => r.id)
        return ids.includes(recipe.id) ? col.id : null
      })
    )
    setAddToCollMemberIds(results.filter(Boolean) as string[])
    setAddToCollRecipe(recipe)
  }, [collections])

  const handleAddToCollToggle = useCallback(async (collectionId: string, isMember: boolean) => {
    if (!addToCollRecipe) return
    if (isMember) {
      await fetch(`/api/collections/${collectionId}/recipes`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe_id: addToCollRecipe.id }),
      })
      setAddToCollMemberIds((prev) => prev.filter((id) => id !== collectionId))
      setCollections((prev) => prev.map((c) =>
        c.id === collectionId ? { ...c, recipe_count: Math.max(0, (c.recipe_count ?? 1) - 1) } : c
      ))
    } else {
      await fetch(`/api/collections/${collectionId}/recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe_id: addToCollRecipe.id }),
      })
      setAddToCollMemberIds((prev) => [...prev, collectionId])
      setCollections((prev) => prev.map((c) =>
        c.id === collectionId ? { ...c, recipe_count: (c.recipe_count ?? 0) + 1 } : c
      ))
    }
  }, [addToCollRecipe])

  // ── Delete recipe ─────────────────────────────────────────────────────────
  const handleDeleteRecipe = useCallback(async (recipe: RecipeCard) => {
    if (!confirm(`Delete "${recipe.title}"? This cannot be undone.`)) return
    await fetch(`/api/recipes/${recipe.slug}`, { method: 'DELETE' })
    setRecipes((prev) => prev.filter((r) => r.id !== recipe.id))
    setCollectionRecipes((prev) => prev.filter((r) => r.id !== recipe.id))
  }, [])

  // ── Context actions for catalog cards ────────────────────────────────────
  const getCatalogContextActions = useCallback((recipe: RecipeCard) => [
    { label: 'Add to collection', onClick: () => handleOpenAddToCollection(recipe) },
    { label: 'Edit recipe', onClick: () => router.push(`/admin/edit/${recipe.slug}`) },
    { label: 'Delete recipe', onClick: () => handleDeleteRecipe(recipe), destructive: true as const },
  ], [handleOpenAddToCollection, handleDeleteRecipe, router])

  const activeFiltersCount = selectedTags.length + selectedCategories.length
  const activeCollection = collections.find((c) => c.id === activeCollectionId) ?? null

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Header */}
      <header
        className="border-b flex-shrink-0 z-10 no-print backdrop-blur-sm"
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
            {/* User menu */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l" style={{ borderColor: 'var(--border)' }}>
              <span className="text-xs max-w-[120px] truncate" style={{ color: 'var(--text-muted)' }} title={userEmail}>
                {userEmail}
              </span>
              <button
                onClick={handleSignOut}
                className="text-xs px-2.5 py-1.5 rounded-lg border transition-colors hover:text-red-600 hover:border-red-200"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Below-header area */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col min-h-0">

          {/* Search + filter button (mobile) + view toggle row — hidden when viewing collection */}
          {!activeCollectionId && (
            <div className="flex items-center gap-3 pt-8 pb-0 flex-shrink-0 no-print">
              <div className="flex-1">
                <SearchBar value={search} onChange={handleSearch} />
              </div>
              <button
                onClick={() => setFilterModalOpen(true)}
                className="lg:hidden btn-secondary flex items-center gap-1.5 relative"
                aria-label="Open filters"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Filters
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-terracotta text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              <ViewToggle view={view} onChange={setView} />
            </div>
          )}

          {/* Two-column area */}
          <div className={`flex gap-8 flex-1 min-h-0 ${activeCollectionId ? 'pt-0' : 'pt-8'}`}>
            {/* Sidebar */}
            <div className="hidden lg:flex flex-col w-52 flex-shrink-0 min-h-0 no-print">
              {/* Tab switcher */}
              <div className="flex gap-1 mb-4 flex-shrink-0 pt-8">
                <button
                  onClick={() => setSidebarTab('filters')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    sidebarTab === 'filters' ? 'bg-terracotta text-white' : 'hover:bg-surface-2'
                  }`}
                  style={sidebarTab !== 'filters' ? { color: 'var(--text-muted)' } : {}}
                >
                  Filters
                </button>
                <button
                  onClick={() => setSidebarTab('collections')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    sidebarTab === 'collections' ? 'bg-terracotta text-white' : 'hover:bg-surface-2'
                  }`}
                  style={sidebarTab !== 'collections' ? { color: 'var(--text-muted)' } : {}}
                >
                  Collections
                  {collections.length > 0 && (
                    <span className="ml-1.5 text-[10px]">({collections.length})</span>
                  )}
                </button>
              </div>

              {/* Sidebar content — scrollable */}
              <div className="flex-1 overflow-y-auto pb-8">
                {sidebarTab === 'filters' ? (
                  <FilterSidebar
                    tags={tagList}
                    categories={categoryList}
                    selectedTags={selectedTags}
                    selectedCategories={selectedCategories}
                    showConcepts={showConcepts}
                    onTagToggle={handleTagToggle}
                    onCategoryToggle={handleCategoryToggle}
                    onClear={handleClear}
                    onEditLabels={() => setLabelsModalOpen(true)}
                    onShowConceptsToggle={handleShowConceptsToggle}
                  />
                ) : (
                  <CollectionsSidebar
                    collections={collections}
                    activeCollectionId={activeCollectionId}
                    onSelect={handleSelectCollection}
                    onCreate={handleCreateCollection}
                  />
                )}
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0 overflow-y-auto pb-24 sm:pb-8">
              {activeCollection ? (
                /* Collection view */
                <div className="pt-8 h-full flex flex-col">
                  <CollectionView
                    collection={activeCollection}
                    recipes={collectionRecipes}
                    onClose={handleCloseCollection}
                    onRename={handleRenameCollection}
                    onDelete={handleDeleteCollection}
                    onRemoveRecipe={handleRemoveFromCollection}
                    onReorder={handleReorderCollection}
                    onAddRecipes={() => setAddRecipesModalOpen(true)}
                    onEditRecipe={(slug) => router.push(`/admin/edit/${slug}`)}
                    onDeleteRecipe={handleDeleteRecipe}
                  />
                </div>
              ) : (
                /* Catalog view */
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {loading ? t('loading') : t('recipeCount', { n: recipes.length })}
                    </p>
                  </div>
                  <div className={`transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    {view === 'grid' ? (
                      <RecipeGrid recipes={recipes} getContextActions={getCatalogContextActions} />
                    ) : (
                      <RecipeList recipes={recipes} getContextActions={getCatalogContextActions} />
                    )}
                  </div>
                </>
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

      {/* Mobile filter modal */}
      {filterModalOpen && (
        <MobileFilterModal
          tags={tagList}
          categories={categoryList}
          selectedTags={selectedTags}
          selectedCategories={selectedCategories}
          showConcepts={showConcepts}
          onTagToggle={handleTagToggle}
          onCategoryToggle={handleCategoryToggle}
          onClear={handleClear}
          onEditLabels={() => { setFilterModalOpen(false); setLabelsModalOpen(true) }}
          onShowConceptsToggle={handleShowConceptsToggle}
          onClose={() => setFilterModalOpen(false)}
        />
      )}

      {/* Labels modal */}
      {labelsModalOpen && (
        <LabelsModal
          tags={tagList}
          categories={categoryList}
          onClose={() => setLabelsModalOpen(false)}
          onTagsChange={handleTagsChange}
          onCategoriesChange={handleCategoriesChange}
        />
      )}

      {/* Settings modal */}
      {settingsOpen && (
        <SettingsModal onClose={() => setSettingsOpen(false)} />
      )}

      {/* Add to collection modal (from catalog card) */}
      {addToCollRecipe && (
        <AddToCollectionModal
          recipe={addToCollRecipe}
          collections={collections}
          memberCollectionIds={addToCollMemberIds}
          onToggle={handleAddToCollToggle}
          onClose={() => { setAddToCollRecipe(null); setAddToCollMemberIds([]) }}
        />
      )}

      {/* Add recipes modal (from collection view) */}
      {addRecipesModalOpen && activeCollection && (
        <AddRecipesModal
          collectionName={activeCollection.name}
          allRecipes={recipes}
          memberIds={collectionRecipes.map((r) => r.id)}
          onToggle={handleAddRecipeToggle}
          onClose={() => setAddRecipesModalOpen(false)}
        />
      )}
    </div>
  )
}
