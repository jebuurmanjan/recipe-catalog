'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Collection, RecipeCard } from '@/types'
import type { ContextAction } from '@/components/ui/RecipeContextMenu'
import RecipeContextMenu from '@/components/ui/RecipeContextMenu'

interface Props {
  collection: Collection
  recipes: RecipeCard[]
  onClose: () => void
  onRename: (name: string) => Promise<void>
  onDelete: () => Promise<void>
  onRemoveRecipe: (recipeId: string) => void
  onReorder: (orderedIds: string[]) => void
  onAddRecipes: () => void
  onEditRecipe: (slug: string) => void
  onDeleteRecipe: (recipe: RecipeCard) => void
}

export default function CollectionView({
  collection,
  recipes,
  onClose,
  onRename,
  onDelete,
  onRemoveRecipe,
  onReorder,
  onAddRecipes,
  onEditRecipe,
  onDeleteRecipe,
}: Props) {
  const [items, setItems] = useState<RecipeCard[]>(recipes)
  const [editing, setEditing] = useState(false)
  const [nameValue, setNameValue] = useState(collection.name)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  // Keep items in sync when recipes prop changes
  useEffect(() => { setItems(recipes) }, [recipes])
  useEffect(() => { setNameValue(collection.name) }, [collection.name])
  useEffect(() => { if (editing) nameRef.current?.focus() }, [editing])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((r) => r.id === active.id)
    const newIndex = items.findIndex((r) => r.id === over.id)
    const next = arrayMove(items, oldIndex, newIndex)
    setItems(next)
    onReorder(next.map((r) => r.id))
  }

  async function handleRename(e: React.FormEvent) {
    e.preventDefault()
    if (!nameValue.trim() || nameValue.trim() === collection.name) { setEditing(false); return }
    setSaving(true)
    try { await onRename(nameValue.trim()); setEditing(false) }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!confirm(`Delete collection "${collection.name}"? Recipes will not be deleted.`)) return
    setDeleting(true)
    try { await onDelete() } finally { setDeleting(false) }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 flex-shrink-0">
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg transition-colors flex-shrink-0"
          style={{ color: 'var(--text-muted)' }}
          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          aria-label="Back to catalog"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M10 3L5 8l5 5" />
          </svg>
        </button>

        {editing ? (
          <form onSubmit={handleRename} className="flex-1 flex gap-2 items-center">
            <input
              ref={nameRef}
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') { setEditing(false); setNameValue(collection.name) } }}
              disabled={saving}
              className="flex-1 min-w-0 font-serif text-xl font-bold px-2 py-0.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
            <button type="submit" disabled={saving || !nameValue.trim()} className="btn-primary text-sm py-1.5 px-3">Save</button>
            <button type="button" onClick={() => { setEditing(false); setNameValue(collection.name) }} className="btn-secondary text-sm py-1.5 px-3">Cancel</button>
          </form>
        ) : (
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <h2 className="font-serif text-xl font-bold truncate" style={{ color: 'var(--text-primary)' }}>
              {collection.name}
            </h2>
            <button
              onClick={() => setEditing(true)}
              className="flex-shrink-0 p-1 rounded transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--terracotta)')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              aria-label="Rename collection"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M11.5 2.5l2 2-9 9H2.5v-2l9-9z" />
              </svg>
            </button>
          </div>
        )}

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex-shrink-0 p-1.5 rounded-lg transition-colors text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-40"
          aria-label="Delete collection"
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M3 4h10M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M6 7v5M10 7v5M4 4l.5 9a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1L12 4" />
          </svg>
        </button>
      </div>

      {/* Add recipes button */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {items.length} {items.length === 1 ? 'recipe' : 'recipes'}
        </p>
        <button onClick={onAddRecipes} className="btn-secondary text-sm flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
            <path d="M7 2v10M2 7h10" />
          </svg>
          Add recipes
        </button>
      </div>

      {/* Recipe list — draggable */}
      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden className="mb-3" style={{ color: 'var(--border)' }}>
            <rect x="6" y="10" width="28" height="22" rx="3" stroke="currentColor" strokeWidth="2" />
            <path d="M14 20h12M14 25h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="font-serif text-lg" style={{ color: 'var(--text-muted)' }}>Empty collection</p>
          <button onClick={onAddRecipes} className="mt-3 btn-primary text-sm">Add recipes</button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((r) => r.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2 pb-8">
                {items.map((recipe) => (
                  <SortableRecipeRow
                    key={recipe.id}
                    recipe={recipe}
                    contextActions={[
                      { label: 'Remove from collection', onClick: () => onRemoveRecipe(recipe.id) },
                      { label: 'Edit recipe', onClick: () => onEditRecipe(recipe.slug) },
                      { label: 'Delete recipe', onClick: () => onDeleteRecipe(recipe), destructive: true },
                    ]}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}

function SortableRecipeRow({ recipe, contextActions }: { recipe: RecipeCard; contextActions: ContextAction[] }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: recipe.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      className="flex items-center gap-2 px-4 py-3 rounded-xl border transition-all"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 rounded"
        style={{ color: 'var(--text-muted)', touchAction: 'none' }}
        aria-label="Drag to reorder"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
          <circle cx="5" cy="3" r="1.2" />
          <circle cx="9" cy="3" r="1.2" />
          <circle cx="5" cy="7" r="1.2" />
          <circle cx="9" cy="7" r="1.2" />
          <circle cx="5" cy="11" r="1.2" />
          <circle cx="9" cy="11" r="1.2" />
        </svg>
      </button>

      {/* Thumbnail */}
      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--bg-surface-2)' }}>
        {recipe.image_url ? (
          <Image src={recipe.image_url} alt="" fill className="object-cover" sizes="40px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden style={{ color: 'var(--border)' }}>
              <path d="M3 20l6-8 5 6 3-4 5 6H3z" fill="currentColor" opacity="0.5" />
            </svg>
          </div>
        )}
      </div>

      {/* Title + description */}
      <Link href={`/recipe/${recipe.slug}`} className="flex-1 min-w-0 group">
        <p className="font-serif text-sm font-semibold truncate group-hover:text-terracotta transition-colors" style={{ color: 'var(--text-primary)' }}>
          {recipe.title}
        </p>
        {recipe.description && (
          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {recipe.description}
          </p>
        )}
      </Link>

      {/* Context menu */}
      <RecipeContextMenu actions={contextActions} />
    </div>
  )
}
