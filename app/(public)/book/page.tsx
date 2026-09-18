import { BookManager } from "@/components/booking/book-manager"
import { listActiveServices } from "@/lib/supabase/queries/services"

export default async function BookPage() {

  const services = await listActiveServices()

  return (
    <BookManager
      services={services}
    />
  )
}