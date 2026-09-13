import { Suspense } from "react"

import { ProductsManager } from "@/components/inventory/products/products-manager"
import { PageLoader } from "@/components/shared/page-loader"
import { parseProductListFilters } from "@/lib/constants/product-filters"
import { listProducts } from "@/lib/supabase/queries/products"
import { listSuppliers } from "@/lib/supabase/queries/suppliers"

type ProductsPageProps = {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ProductsPage({
    searchParams,
}: ProductsPageProps) {
    const params = await searchParams
    const filters = parseProductListFilters(params)
    const products = await listProducts(filters)
    const suppliers = await listSuppliers()

    return (
        <Suspense fallback={<PageLoader label="Loading products…" />}>
            <ProductsManager
                suppliers={suppliers}
                products={products}
                filters={filters}
            />
        </Suspense>
    )
}