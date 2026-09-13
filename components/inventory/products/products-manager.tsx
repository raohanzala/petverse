"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { getProductColumns } from "@/components/inventory/products/product-columns"
import { ProductFilters } from "./product-filters"
import { ProductFormDialog } from "@/components/inventory/products/product-form-dialog"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import type { ProductListFilters } from "@/lib/constants/product-filters"
import { deleteProduct } from "@/lib/supabase/mutations/products"
import type {
  ProductRow,
  SupplierRow,
} from "@/lib/supabase/types"

type ProductsManagerProps = {
  products: ProductRow[]
  suppliers: SupplierRow[]
  filters: ProductListFilters
}

export function ProductsManager({
  products,
  suppliers,
  filters,
}: ProductsManagerProps) {
  const router = useRouter()

  const [isFiltering, setIsFiltering] = useState(false)
  const [formOpen, setFormOpen] = useState(false)

  const [editingProduct, setEditingProduct] =
    useState<ProductRow | null>(null)

  const [deletingProduct, setDeletingProduct] =
    useState<ProductRow | null>(null)

  const [isDeleting, setIsDeleting] = useState(false)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setEditingProduct(null)
    setFormOpen(true)
  }

  function openEdit(product: ProductRow) {
    setEditingProduct(product)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingProduct) return

    setIsDeleting(true)

    const result = await deleteProduct(deletingProduct.id)

    setIsDeleting(false)

    if (!result.success) {
      toast.add({
        type: "error",
        description: result.error,
        priority: "high",
      })

      return
    }

    toast.add({
      type: "success",
      description: "Product deleted",
      priority: "high",
    })

    setDeletingProduct(null)
    refreshList()
  }

  const columns = useMemo(
    () =>
      getProductColumns({
        onEdit: openEdit,
        onDelete: setDeletingProduct,
      }),
    []
  )

  const emptyMessage =
    filters.search ||
    filters.status !== "all" ||
    filters.supplierId !== "all"
      ? "No products match your filters."
      : "No products yet. Create your first one to get started."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage inventory products, suppliers, pricing, and stock. Search and filters run on the server via URL params."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            New product
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={products}
        pageSize={10}
        isLoading={isFiltering}
        enableColumnVisibility
        emptyMessage={emptyMessage}
        toolbar={
          <ServerFiltersToolbar
            filters={filters}
            suppliers={suppliers}
            onLoadingChange={setIsFiltering}
          />
        }
      />

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editingProduct}
        suppliers={suppliers}
        onSuccess={refreshList}
      />

      <AlertDialog
        open={Boolean(deletingProduct)}
        onOpenChange={(open) => {
          if (!open) setDeletingProduct(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{deletingProduct?.name}</strong>.
              Invoice line items linked to this product will keep their
              existing data but lose the product reference.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault()
                void confirmDelete()
              }}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/** Server-driven filters rendered in the DataTable toolbar row. */
function ServerFiltersToolbar({
  filters,
  suppliers,
  onLoadingChange,
}: {
  filters: ProductListFilters
  suppliers: SupplierRow[]
  onLoadingChange: (loading: boolean) => void
}) {
  return (
    <ProductFilters
      initialSearch={filters.search ?? ""}
      initialStatus={filters.status ?? "all"}
      initialSupplierId={filters.supplierId?? "all"}
      suppliers={suppliers}
      onLoadingChange={onLoadingChange}
    />
  )
}