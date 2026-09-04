import { BookManager } from "@/components/booking/book-manager"
import { listServiceCategories } from "@/lib/supabase/queries/service-categories"
import { listActiveServices } from "@/lib/supabase/queries/services"

export default async function BookPage() {
  const [services, categories] = await Promise.all([
    listActiveServices(),
    listServiceCategories(),
  ])

  return (
    <BookManager
      services={services}
      categories={categories}
    />
  )
}