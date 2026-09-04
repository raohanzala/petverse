"use server"

import { revalidatePath } from "next/cache"

import { requireStaff } from "@/lib/auth/session"
import {
    getSupabaseErrorMessage,
    mutationError,
    mutationSuccess,
    type MutationResult,
} from "@/lib/supabase/errors"
import { createClient } from "@/lib/supabase/server"
import type { ServicePackageRow } from "@/lib/supabase/types"
import {
    createServicePackageSchema,
    deleteServicePackageSchema,
    updateServicePackageSchema,
    type CreateServicePackageInput,
    type UpdateServicePackageInput,
} from "@/lib/validations/service-package"

const REVALIDATE_PATHS = [
    "/admin/catalog/packages",
    "/admin/catalog/package-steps",
    "/admin/catalog/services",
    "/book",
] as const

function revalidatePackagePaths() {
    for (const path of REVALIDATE_PATHS) {
        revalidatePath(path)
    }
}

function normalizeDescription(value: string | null | undefined) {
    const trimmed = value?.trim()
    return trimmed ? trimmed : null
}

export async function createServicePackage(
    input: CreateServicePackageInput
): Promise<MutationResult<ServicePackageRow>> {
    await requireStaff()

    const parsed = createServicePackageSchema.safeParse({
        ...input,
        description: normalizeDescription(input.description),
    })

    if (!parsed.success) {
        return mutationError(parsed.error.issues[0]?.message ?? "Invalid input")
    }

    const supabase = await createClient()

    const { data, error } = await supabase
        .from("service_packages")
        .insert({
            name: parsed.data.name.trim(),
            description: parsed.data.description,
            price: parsed.data.price,
            duration_minutes: parsed.data.duration_minutes,
            step_mode: parsed.data.step_mode,
            is_active: parsed.data.is_active,
        })
        .select()
        .single()

    if (error) {
        return mutationError(
            getSupabaseErrorMessage(
                error,
                "Failed to create package"
            )
        )
    }

    revalidatePackagePaths()
    return mutationSuccess(data)
}

export async function updateServicePackage(
    input: UpdateServicePackageInput
): Promise<MutationResult<ServicePackageRow>> {
    await requireStaff()

    const parsed = updateServicePackageSchema.safeParse({
        ...input,
        description:
            input.description !== undefined
                ? normalizeDescription(input.description)
                : undefined,
    })

    if (!parsed.success) {
        // console.log(
        //     "PACKAGE UPDATE VALIDATION ERROR:",
        //     parsed.error.issues
        // )

        return mutationError(
            parsed.error.issues[0]?.message ?? "Invalid input"
        )
    }

    const { id, ...updates } = parsed.data

    const payload: Record<string, unknown> = {}

    if (updates.name !== undefined) {
        payload.name = updates.name.trim()
    }

    if (updates.description !== undefined) {
        payload.description = updates.description
    }

    if (updates.price !== undefined) {
        payload.price = updates.price
    }

    if (updates.duration_minutes !== undefined) {
        payload.duration_minutes = updates.duration_minutes
    }

    if (updates.step_mode !== undefined) {
        payload.step_mode = updates.step_mode
    }

    if (updates.is_active !== undefined) {
        payload.is_active = updates.is_active
    }

    if (Object.keys(payload).length === 0) {
        return mutationError("No changes to save")
    }

    const supabase = await createClient()

    const { data, error } = await supabase
        .from("service_packages")
        .update(payload)
        .eq("id", id)
        .select()
        .single()

    if (error) {
        return mutationError(
            getSupabaseErrorMessage(
                error,
                "Failed to update package"
            )
        )
    }

    revalidatePackagePaths()
    return mutationSuccess(data)
}

export async function deleteServicePackage(
    id: number
): Promise<MutationResult> {
    await requireStaff()

    const parsed = deleteServicePackageSchema.safeParse({ id })

    if (!parsed.success) {
        return mutationError(
            parsed.error.issues[0]?.message ?? "Invalid package"
        )
    }

    const supabase = await createClient()

    const { error } = await supabase
        .from("service_packages")
        .delete()
        .eq("id", parsed.data.id)

    if (error) {
        return mutationError(
            getSupabaseErrorMessage(
                error,
                "Failed to delete package"
            )
        )
    }

    revalidatePackagePaths()
    return mutationSuccess(undefined)
}