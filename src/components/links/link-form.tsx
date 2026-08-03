"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UseFormRegister } from "react-hook-form";
import {
  createLinkSchema,
  type CreateLinkValues,
} from "@/lib/validations/links";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

function toLocalInputValue(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export function LinkForm({
  defaultValues,
  folders,
  tags,
  isSubmitting,
  submitLabel = "Create link",
  hasExistingPassword = false,
  onSubmit,
}: {
  defaultValues?: Partial<CreateLinkValues>;
  folders: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  isSubmitting: boolean;
  submitLabel?: string;
  hasExistingPassword?: boolean;
  onSubmit: (values: CreateLinkValues) => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateLinkValues>({
    resolver: zodResolver(createLinkSchema),
    defaultValues: {
      destination: "",
      slug: "",
      title: "",
      description: "",
      notes: "",
      folderId: "__none__",
      tagIds: [],
      password: "",
      expiresAt: "",
      activateAt: "",
      utmSource: "",
      utmMedium: "",
      utmCampaign: "",
      utmTerm: "",
      utmContent: "",
      iosDeepLink: "",
      androidDeepLink: "",
      ...defaultValues,
    },
  });

  const tagIds = watch("tagIds") ?? [];

  function handleSubmitValue(values: CreateLinkValues) {
    const payload: CreateLinkValues = { ...values };
    if (values.folderId === "__none__") {
      payload.folderId = undefined;
    }
    if (values.expiresAt) {
      payload.expiresAt = new Date(values.expiresAt).toISOString();
    }
    if (values.activateAt) {
      payload.activateAt = new Date(values.activateAt).toISOString();
    }
    if (hasExistingPassword && !values.password) {
      // Keep the existing password untouched.
      delete (payload as Partial<CreateLinkValues>).password;
    }
    onSubmit(payload);
  }

  return (
    <form
      id="link-form"
      onSubmit={handleSubmit(handleSubmitValue)}
      className="grid gap-5"
      noValidate
    >
      <div className="grid gap-2">
        <Label htmlFor="destination">Destination URL</Label>
        <Input
          id="destination"
          type="url"
          placeholder="https://example.com/my-page"
          {...register("destination")}
          aria-invalid={!!errors.destination}
        />
        {errors.destination && (
          <p className="text-sm text-destructive">
            {errors.destination.message}
          </p>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="My awesome link"
            {...register("title")}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="slug">Custom slug</Label>
          <Input
            id="slug"
            placeholder="auto-generated"
            {...register("slug")}
            aria-invalid={!!errors.slug}
          />
          {errors.slug && (
            <p className="text-sm text-destructive">{errors.slug.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="Shown when someone unlocks or previews the link"
          {...register("description")}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Private notes for yourself"
          {...register("notes")}
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label>Folder</Label>
          <Select
            value={watch("folderId") ?? ""}
            onValueChange={(v) =>
              setValue("folderId", !v || v === "__none__" ? undefined : v)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="No folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">No folder</SelectItem>
              {folders.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Tags</Label>
          <TagPicker
            tags={tags}
            value={tagIds}
            onChange={(ids) => setValue("tagIds", ids)}
          />
        </div>
      </div>

      <UTMSection register={register} />

      <div className="grid gap-2">
        <Label htmlFor="password">
          {hasExistingPassword ? "New password (optional)" : "Password (optional)"}
        </Label>
        <Input
          id="password"
          type="password"
          placeholder={
            hasExistingPassword
              ? "Leave blank to keep the current password"
              : "Leave blank for no password"
          }
          autoComplete="new-password"
          {...register("password")}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="activateAt">Activate at</Label>
          <Input id="activateAt" type="datetime-local" {...register("activateAt")} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="expiresAt">Expires at</Label>
          <Input id="expiresAt" type="datetime-local" {...register("expiresAt")} />
        </div>
        {errors.activateAt && (
          <p className="text-sm text-destructive">{errors.activateAt.message}</p>
        )}
        {errors.expiresAt && (
          <p className="text-sm text-destructive">{errors.expiresAt.message}</p>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="iosDeepLink">iOS deep link (optional)</Label>
          <Input
            id="iosDeepLink"
            placeholder="myapp://path"
            {...register("iosDeepLink")}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="androidDeepLink">Android deep link (optional)</Label>
          <Input
            id="androidDeepLink"
            placeholder="myapp://path"
            {...register("androidDeepLink")}
          />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}

function UTMSection({
  register,
}: {
  register: UseFormRegister<CreateLinkValues>;
}) {
  const fields = [
    { key: "utmSource", label: "Source", placeholder: "newsletter" },
    { key: "utmMedium", label: "Medium", placeholder: "email" },
    { key: "utmCampaign", label: "Campaign", placeholder: "summer-launch" },
    { key: "utmTerm", label: "Term", placeholder: "paid-keyword" },
    { key: "utmContent", label: "Content", placeholder: "hero-button" },
  ] as const;
  return (
    <div className="grid gap-3 rounded-lg border p-3">
      <p className="text-sm font-medium">UTM parameters</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} className="grid gap-1.5">
            <Label htmlFor={f.key} className="text-xs text-muted-foreground">
              {f.label}
            </Label>
            <Input
              id={f.key}
              placeholder={f.placeholder}
              {...register(f.key)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function TagPicker({
  tags,
  value,
  onChange,
}: {
  tags: { id: string; name: string }[];
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          />
        }
      >
        {value.length
          ? tags
              .filter((t) => value.includes(t.id))
              .map((t) => t.name)
              .join(", ")
          : "Select tags"}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search tags…" />
          <CommandEmpty>No tags found.</CommandEmpty>
          <CommandGroup>
            {tags.map((tag) => (
              <CommandItem
                key={tag.id}
                value={tag.name}
                onSelect={() => toggle(tag.id)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value.includes(tag.id) ? "opacity-100" : "opacity-0",
                  )}
                />
                {tag.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}