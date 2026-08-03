"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import {
  updateProfileSchema,
  type UpdateProfileValues,
} from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export function ProfileForm({
  name,
  email,
  image,
}: {
  name: string;
  email: string;
  image?: string | null;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name, image: image ?? "" },
  });

  const watchedImage = watch("image");
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function onSubmit(values: UpdateProfileValues) {
    setIsLoading(true);
    const { error } = await authClient.updateUser({
      name: values.name,
      image: values.image || undefined,
    });
    setIsLoading(false);

    if (error) {
      toast.error(error.message ?? "Unable to update profile");
      return;
    }
    toast.success("Profile updated");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          {watchedImage ? <AvatarImage src={watchedImage} alt={name} /> : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">Profile picture</p>
          <p className="text-sm text-muted-foreground">
            Paste a URL to an image, or leave blank.
          </p>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="image">Avatar URL</Label>
        <Input
          id="image"
          type="url"
          placeholder="https://example.com/avatar.png"
          {...register("image")}
          aria-invalid={!!errors.image}
        />
        {errors.image && (
          <p className="text-sm text-destructive">{errors.image.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled />
        <p className="text-xs text-muted-foreground">
          Email changes are not supported yet.
        </p>
      </div>

      <Button type="submit" disabled={isLoading} className="w-fit">
        {isLoading ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}