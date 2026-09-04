"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createEmployee,
  updateEmployee,
} from "@/lib/supabase/mutations/employees"
import type { EmployeeRow } from "@/lib/supabase/types"
import {
  createEmployeeSchema,
  type CreateEmployeeInput,
} from "@/lib/validations/employee"

type EmployeeFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: EmployeeRow | null
  onSuccess: () => void
}

const defaultValues: CreateEmployeeInput = {
  user_id: null,
  display_name: "",
  initials: "",
  avatar_url: "",
  role: "groomer",
  job_title: "",
  color: "",
  is_active: true,
}

const employeeRoles = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "groomer", label: "Groomer" },
  { value: "veterinarian", label: "Veterinarian" },
  { value: "boarding_attendant", label: "Boarding Attendant" },
] as const

export function EmployeeFormDialog({
  open,
  onOpenChange,
  employee,
  onSuccess,
}: EmployeeFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = Boolean(employee)

  const form = useForm<CreateEmployeeInput>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return

    if (employee) {
      form.reset({
        user_id: employee.user_id,
        display_name: employee.display_name,
        initials: employee.initials ?? "",
        avatar_url: employee.avatar_url ?? "",
        role: employee.role,
        job_title: employee.job_title ?? "",
        color: employee.color ?? "",
        is_active: employee.is_active,
      })
      return
    }

    form.reset(defaultValues)
  }, [open, employee, form])

  async function onSubmit(values: CreateEmployeeInput) {
    setIsSubmitting(true)

    const result = isEditing
      ? await updateEmployee({ id: employee!.id, ...values })
      : await createEmployee(values)

    setIsSubmitting(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success(
      isEditing ? "Employee updated" : "Employee created"
    )

    onOpenChange(false)
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit employee" : "New employee"}
          </DialogTitle>
          <DialogDescription>
            Add a team member who can provide services and manage appointments.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="space-y-5 h-100 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <FieldGroup>
              <Field data-invalid={!!form.formState.errors.display_name}>
                <FieldLabel htmlFor="employee-display-name">
                  Display name
                </FieldLabel>
                <Input
                  id="employee-display-name"
                  placeholder="Sarah Ahmed"
                  aria-invalid={!!form.formState.errors.display_name}
                  {...form.register("display_name")}
                />
                <FieldError
                  errors={[form.formState.errors.display_name]}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.initials}>
                <FieldLabel htmlFor="employee-initials">
                  Initials
                </FieldLabel>
                <Input
                  id="employee-initials"
                  placeholder="SA"
                  maxLength={10}
                  aria-invalid={!!form.formState.errors.initials}
                  {...form.register("initials")}
                />
                <FieldDescription>
                  Used when an avatar image is not available.
                </FieldDescription>
                <FieldError
                  errors={[form.formState.errors.initials]}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.avatar_url}>
                <FieldLabel htmlFor="employee-avatar-url">
                  Avatar URL
                </FieldLabel>
                <Input
                  id="employee-avatar-url"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  aria-invalid={!!form.formState.errors.avatar_url}
                  {...form.register("avatar_url")}
                />
                <FieldDescription>
                  Optional profile image URL.
                </FieldDescription>
                <FieldError
                  errors={[form.formState.errors.avatar_url]}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.role}>
                <FieldLabel htmlFor="employee-role">
                  Role
                </FieldLabel>

                <Select
                  value={form.watch("role")}
                  onValueChange={(value) =>
                    form.setValue(
                      "role",
                      value as CreateEmployeeInput["role"],
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }
                >
                  <SelectTrigger
                    id="employee-role"
                    aria-invalid={!!form.formState.errors.role}
                  >
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>

                  <SelectContent>
                    {employeeRoles.map((role) => (
                      <SelectItem
                        key={role.value}
                        value={role.value}
                      >
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldDescription>
                  Determines the employee's primary responsibility.
                </FieldDescription>

                <FieldError
                  errors={[form.formState.errors.role]}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.job_title}>
                <FieldLabel htmlFor="employee-job-title">
                  Job title
                </FieldLabel>
                <Input
                  id="employee-job-title"
                  placeholder="Senior Groomer"
                  aria-invalid={!!form.formState.errors.job_title}
                  {...form.register("job_title")}
                />
                <FieldDescription>
                  Optional title shown below the employee name.
                </FieldDescription>
                <FieldError
                  errors={[form.formState.errors.job_title]}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.color}>
                <FieldLabel htmlFor="employee-color">
                  Color
                </FieldLabel>
                <Input
                  id="employee-color"
                  placeholder="#C9974C"
                  aria-invalid={!!form.formState.errors.color}
                  {...form.register("color")}
                />
                <FieldDescription>
                  Optional color used to identify this employee in the UI.
                </FieldDescription>
                <FieldError
                  errors={[form.formState.errors.color]}
                />
              </Field>

              <Field orientation="horizontal">
                <div className="flex flex-1 flex-col gap-1">
                  <FieldLabel htmlFor="employee-active">
                    Active
                  </FieldLabel>

                  <FieldDescription>
                    Inactive employees are hidden from active staff selections.
                  </FieldDescription>
                </div>

                <Switch
                  id="employee-active"
                  checked={form.watch("is_active")}
                  onCheckedChange={(checked) =>
                    form.setValue("is_active", checked, {
                      shouldDirty: true,
                    })
                  }
                />
              </Field>
            </FieldGroup>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner
                      size="sm"
                      className="text-primary-foreground"
                    />
                    Saving…
                  </>
                ) : isEditing ? (
                  "Save changes"
                ) : (
                  "Create employee"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}