import { createClient } from "@/lib/supabase/server"
import type {
  ProductListRow,
  ProductRow,
  ProductSupplierOption,
} from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"
import { ProductListFilters } from "@/lib/constants/product-filters"

const PRODUCT_COLUMNS = `
  id,
  supplier_id,
  sku,
  name,
  brand,
  category,
  retail_price,
  cost_price,
  stock_qty,
  is_active,
  created_at,
  updated_at,

  supplier:suppliers (
    id,
    name
  )
`

const PRODUCT_LIST_COLUMNS = `
  id,
  supplier_id,
  sku,
  name,
  brand,
  category,
  retail_price,
  cost_price,
  stock_qty,
  is_active,
  created_at,
  updated_at,
  supplier:suppliers (
    id,
    name
  )
` as const

function normalizeRelation<T>(
  value: T | T[] | null | undefined
): T | null {
  if (value == null) return null

  return Array.isArray(value)
    ? value[0] ?? null
    : value
}

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

/** Admin list — supports server-side search, status, and supplier filters */
export async function listProducts(
  filters: ProductListFilters
): Promise<ProductListRow[]> {
  const supabase = await createClient()

  const {
    search,
    status = "all",
    supplierId
  } = filters

  let query = supabase
    .from("products")
    .select(PRODUCT_LIST_COLUMNS)

  if (status === "active") {
    query = query.eq("is_active", true)
  } else if (status === "inactive") {
    query = query.eq("is_active", false)
  }

  if (supplierId && supplierId !== "all") {
    query = query.eq("supplier_id", supplierId)
  }

  if (search) {
    const pattern = `%${escapeIlikePattern(search)}%`

    query = query.or(
      `name.ilike.${pattern},sku.ilike.${pattern}`
    )
  }

  const { data, error } = await query
    .order("name", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(error, "Failed to load products")
    )
  }

  return (data ?? []).map((row) => ({
    ...row,
    supplier: normalizeRelation(row.supplier),
  }))
}

/** Active products — useful for invoices, bookings, and other selectors */
export async function listActiveProducts(): Promise<ProductRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(error, "Failed to load products")
    )
  }

  return (data ?? []).map((row) => ({
    ...row,
    supplier: normalizeRelation(row.supplier),
  }))
}

/** Active products with supplier information */
export async function listActiveProductsWithSuppliers(): Promise<
  ProductListRow[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_LIST_COLUMNS)
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load active products"
      )
    )
  }

  return (data ?? []).map((row) => ({
    ...row,
    supplier: normalizeRelation(row.supplier),
  }))
}

export async function getProductById(
  id: string
): Promise<ProductListRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_LIST_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(error, "Failed to load product")
    )
  }

  if (!data) return null

  return {
    ...data,
    supplier: normalizeRelation(data.supplier),
  }
}

/** Supplier options for the product form and supplier filter */
export async function listProductSuppliers(): Promise<
  ProductSupplierOption[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("suppliers")
    .select("id, name")
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load suppliers"
      )
    )
  }

  return data ?? []
}