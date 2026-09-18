import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  FileText,
  HeartPulse,
  PawPrint,
  Pencil,
  ShieldCheck,
  Stethoscope,
  UserRound
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EmptyState } from "@/components/shared"

type PetPageProps = {
  params: Promise<{
    id: string
  }>
}

function formatDate(value: string | null) {
  if (!value) return "—"

  return new Date(value).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function calculateAge(birthDate: string | null) {
  if (!birthDate) return null

  const birth = new Date(birthDate)
  const today = new Date()

  let years = today.getFullYear() - birth.getFullYear()
  let months = today.getMonth() - birth.getMonth()

  if (today.getDate() < birth.getDate()) {
    months--
  }

  if (months < 0) {
    years--
    months += 12
  }

  if (years > 0) {
    return `${years} ${years === 1 ? "year" : "years"} old`
  }

  if (months > 0) {
    return `${months} ${months === 1 ? "month" : "months"} old`
  }

  return "Less than a month old"
}

function DetailItem({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="text-sm font-medium">
        {value || "—"}
      </p>
    </div>
  )
}

export default async function PetProfilePage({
  params,
}: PetPageProps) {
  const { id } = await params

  const supabase = await createClient()

  const { data: pet, error } = await supabase
    .from("pets")
    .select(`
      id,
      owner_id,
      name,
      species,
      breed,
      birth_date,
      weight_kg,
      color,
      notes,
      is_active,
      created_at,
      updated_at,
      owner:owners (
        id,
        name,
        phone,
        email,
        preferred_contact
      )
    `)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!pet) {
    notFound()
  }

  const owner = Array.isArray(pet.owner)
    ? pet.owner[0] ?? null
    : pet.owner

  const age = calculateAge(pet.birth_date)

  return (
    <div className="space-y-6">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        render={
          <Link href="/admin/clients/pets">
            <ArrowLeft />
            Back to Pets
          </Link>
        }
      />

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <PawPrint className="size-8 text-primary" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {pet.name}
                  </h1>

                  {pet.is_active ? (
                    <Badge variant="completed">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      Inactive
                    </Badge>
                  )}
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  {pet.species}
                  {pet.breed ? ` • ${pet.breed}` : ""}
                  {age ? ` • ${age}` : ""}
                </p>

                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <UserRound className="size-4" />

                  <span>
                    Owner:{" "}
                    <span className="font-medium text-foreground">
                      {owner?.name ?? "Unknown owner"}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <Button
              render={
                <Link href={`/admin/pets?edit=${pet.id}`}>
                  <Pencil />
                  Edit Pet
                </Link>
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Pet Information */}
      <Card>
        <CardHeader>
          <CardTitle>Pet Information</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem
              label="Name"
              value={pet.name}
            />

            <DetailItem
              label="Species"
              value={pet.species}
            />

            <DetailItem
              label="Breed"
              value={pet.breed}
            />

            <DetailItem
              label="Date of Birth"
              value={formatDate(pet.birth_date)}
            />

            <DetailItem
              label="Age"
              value={age}
            />

            <DetailItem
              label="Weight"
              value={
                pet.weight_kg !== null
                  ? `${pet.weight_kg} kg`
                  : "—"
              }
            />

            <DetailItem
              label="Color"
              value={pet.color}
            />

            <DetailItem
              label="Owner"
              value={owner?.name}
            />

            <DetailItem
              label="Owner Phone"
              value={owner?.phone}
            />

            <DetailItem
              label="Owner Email"
              value={owner?.email}
            />

            <DetailItem
              label="Preferred Contact"
              value={owner?.preferred_contact}
            />

            <DetailItem
              label="Created"
              value={formatDate(pet.created_at)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Owner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="size-5" />
            Owner Information
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem
              label="Name"
              value={owner?.name}
            />

            <DetailItem
              label="Phone"
              value={owner?.phone}
            />

            <DetailItem
              label="Email"
              value={owner?.email}
            />

            <DetailItem
              label="Preferred Contact"
              value={owner?.preferred_contact}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Medical Records & Notes</CardTitle>
        </CardHeader>

        <CardContent>
          {pet.notes ? (
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="whitespace-pre-wrap text-sm leading-6">
                {pet.notes}
              </p>
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No notes available"
              description="There are no general notes recorded for this pet."
            />
          )}
        </CardContent>
      </Card>

      {/* Boarding Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="size-5" />
            Boarding Instructions
          </CardTitle>
        </CardHeader>

        <CardContent>
          <EmptyState
            icon={ClipboardList}
            title="No boarding instructions"
            description="Boarding instructions for this pet will appear here."
          />
        </CardContent>
      </Card>

      {/* Vaccination */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5" />
            Vaccination Status
          </CardTitle>
        </CardHeader>

        <CardContent>
          <EmptyState
            icon={ShieldCheck}
            title="No vaccination records"
            description="Vaccination records and expiry information will appear here."
          />
        </CardContent>
      </Card>

      {/* Appointment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="size-5" />
            Appointment History
          </CardTitle>
        </CardHeader>

        <CardContent>
          <EmptyState
            icon={CalendarDays}
            title="No appointment history"
            description="Appointments associated with this pet will appear here."
          />
        </CardContent>
      </Card>

      {/* Medical Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="size-5" />
            Medical Records
          </CardTitle>
        </CardHeader>

        <CardContent>
          <EmptyState
            icon={Stethoscope}
            title="No medical records"
            description="Medical examinations, diagnoses, and treatment records will appear here."
          />
        </CardContent>
      </Card>

      {/* Reminder History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="size-5" />
            Reminder History
          </CardTitle>
        </CardHeader>

        <CardContent>
          <EmptyState
            icon={HeartPulse}
            title="No reminder history"
            description="Appointment and vaccination reminders will appear here."
          />
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Documents
          </CardTitle>
        </CardHeader>

        <CardContent>
          <EmptyState
            icon={FileText}
            title="No documents"
            description="Pet images, vaccination certificates, medical documents, and other files will appear here."
          />
        </CardContent>
      </Card>
    </div>
  )
}