export type ServiceCategoryRow = {
  id: string
  name: string
  slug: string
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ServiceCategoryInsert = Pick<
  ServiceCategoryRow,
  "name" | "slug" | "description" | "sort_order" | "is_active"
>

export type ServiceCategoryUpdate = Partial<ServiceCategoryInsert>
