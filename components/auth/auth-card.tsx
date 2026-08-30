import Link from "next/link"
import { PawPrint } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type AuthCardProps = {
  title: string
  description: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function AuthCard({
  title,
  description,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <Card className={cn("w-full max-w-md shadow-md", className)}>
      <CardHeader className="space-y-3 text-center">
        <Link
          href="/"
          className="mx-auto flex w-fit items-center gap-2 text-navy transition-colors hover:text-navy-800"
        >
          <PawPrint className="size-6" />
          <span className="text-lg font-bold">PetCare</span>
        </Link>
        <div className="space-y-1">
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
        {footer ? (
          <div className=" pb-4 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
