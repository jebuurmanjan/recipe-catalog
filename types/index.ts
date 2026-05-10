export interface Recipe {
  id: string
  title: string
  slug: string
  description: string | null
  ingredients: string[]
  steps: string[]
  image_url: string | null
  source_url: string | null
  created_at: string
  updated_at: string
  tags?: Tag[]
  categories?: Category[]
}

export interface Tag {
  id: string
  name: string
}

export type CategoryType = 'cuisine' | 'diet' | 'occasion' | 'effort'

export interface Category {
  id: string
  name: string
  type: CategoryType
}

export interface RecipeFilters {
  search?: string
  tagIds?: string[]
  categoryIds?: string[]
}

/** Shape returned by /api/fetch-recipe */
export interface ParsedRecipe {
  title?: string
  description?: string
  ingredients?: string[]
  steps?: string[]
  image_url?: string
  source_url?: string
}

/** Catalog recipe card (subset of Recipe) */
export interface RecipeCard {
  id: string
  title: string
  slug: string
  description: string | null
  image_url: string | null
  created_at: string
  tags?: Tag[]
  categories?: Category[]
}
