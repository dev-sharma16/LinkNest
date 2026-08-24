"use client";

import { useState } from "react";
import {
  Sparkles,
  Wand2,
  Link2,
  Image,
  X,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAIBuilder } from "@/hooks/use-ai-builder";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const USE_CASES = [
  { value: "personal", label: "Personal" },
  { value: "fitness", label: "Fitness" },
  { value: "gaming", label: "Gaming" },
  { value: "photography", label: "Photography" },
  { value: "developer", label: "Developer" },
  { value: "music", label: "Music" },
  { value: "business", label: "Business" },
  { value: "fashion", label: "Fashion" },
  { value: "beauty", label: "Beauty" },
  { value: "tech", label: "Tech" },
  { value: "education", label: "Education" },
  { value: "other", label: "Other" },
];

type LinkInput = {
  platform?: string;
  url: string;
};

export function AIBuilderDialog({
  open,
  onOpenChange,
  targetType,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: "link_in_bio" | "storefront";
  onSuccess: (designSpec: Record<string, unknown>) => void;
}) {
  const ai = useAIBuilder();

  const [prompt, setPrompt] = useState("");
  const [useCase, setUseCase] = useState<string>("");
  const [referenceUrls, setReferenceUrls] = useState<string[]>([]);
  const [referenceInput, setReferenceInput] = useState("");
  const [links, setLinks] = useState<LinkInput[]>([]);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkPlatform, setLinkPlatform] = useState("");
  const [regenPrompt, setRegenPrompt] = useState("");
  const [showRegen, setShowRegen] = useState(false);

  const isGenerating = ai.isGenerating;
  const hasResult = !!ai.designSpec;
  const error = ai.error?.message;

  function resetForm() {
    setPrompt("");
    setUseCase("");
    setReferenceUrls([]);
    setReferenceInput("");
    setLinks([]);
    setLinkUrl("");
    setLinkPlatform("");
    setRegenPrompt("");
    setShowRegen(false);
    ai.reset();
  }

  function handleClose() {
    resetForm();
    onOpenChange(false);
  }

  async function handleGenerate() {
    if (!prompt.trim()) return;
    await ai.generate.mutateAsync({
      targetType,
      prompt: prompt.trim(),
      useCase: useCase || undefined,
      referenceUrls: referenceUrls.length > 0 ? referenceUrls : undefined,
      links: links.length > 0 ? links : undefined,
    });
  }

  async function handleRegenerate() {
    if (!regenPrompt.trim() || !ai.designSpec) return;
    await ai.regenerate.mutateAsync({
      targetType,
      prompt: regenPrompt.trim(),
      existingDesignSpec: ai.designSpec as unknown as Record<string, unknown>,
    });
    setRegenPrompt("");
    setShowRegen(false);
  }

  function addReferenceUrl() {
    const url = referenceInput.trim();
    if (!url) return;
    try {
      new URL(url);
      setReferenceUrls([...referenceUrls, url]);
      setReferenceInput("");
    } catch {
      // invalid URL
    }
  }

  function removeReferenceUrl(index: number) {
    setReferenceUrls(referenceUrls.filter((_, i) => i !== index));
  }

  function addLink() {
    const url = linkUrl.trim();
    if (!url) return;
    try {
      new URL(url);
      setLinks([...links, { url, platform: linkPlatform || undefined }]);
      setLinkUrl("");
      setLinkPlatform("");
    } catch {
      // invalid URL
    }
  }

  function removeLink(index: number) {
    setLinks(links.filter((_, i) => i !== index));
  }

  function handleApply() {
    if (!ai.designSpec) return;
    onSuccess(ai.designSpec as unknown as Record<string, unknown>);
    handleClose();
  }

  function handleSaveAsPreset() {
    if (!ai.designSpec) return;
    const name = ai.designSpec.metadata?.suggestedName || "My AI Preset";
    ai.saveAsPreset.mutate({
      designSpec: ai.designSpec,
      name,
      description: ai.designSpec.metadata?.suggestedDescription,
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Builder
          </DialogTitle>
          <DialogDescription>
            {targetType === "link_in_bio"
              ? "Describe your ideal Link in Bio page and let AI generate it for you."
              : "Describe your ideal Storefront and let AI generate it for you."}
          </DialogDescription>
        </DialogHeader>

        {!hasResult ? (
          <div className="space-y-4">
            {/* Prompt */}
            <div className="space-y-2">
              <Label htmlFor="ai-prompt">
                What do you want to build?
              </Label>
              <Textarea
                id="ai-prompt"
                placeholder={
                  targetType === "link_in_bio"
                    ? "e.g. I'm a fitness creator. I want a premium dark theme with my Instagram, YouTube, coaching website, and a section for gym product recommendations."
                    : "e.g. Create a clean storefront for my digital products with a minimal white theme, grid layout, and featured products section."
                }
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Use Case */}
            <div className="space-y-2">
              <Label>Use case (optional)</Label>
              <Select value={useCase} onValueChange={(v) => setUseCase(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your niche" />
                </SelectTrigger>
                <SelectContent>
                  {USE_CASES.map((uc) => (
                    <SelectItem key={uc.value} value={uc.value}>
                      {uc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reference URLs */}
            <div className="space-y-2">
              <Label>Reference URLs (optional)</Label>
              <p className="text-xs text-muted-foreground">
                Add websites you like for design inspiration.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com"
                  value={referenceInput}
                  onChange={(e) => setReferenceInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addReferenceUrl();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addReferenceUrl}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {referenceUrls.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {referenceUrls.map((url, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      <Link2 className="h-3 w-3" />
                      {new URL(url).hostname}
                      <button
                        type="button"
                        onClick={() => removeReferenceUrl(i)}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-muted"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Links to include */}
            <div className="space-y-2">
              <Label>Links to include (optional)</Label>
              <p className="text-xs text-muted-foreground">
                Add links you want on your page.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Platform (e.g. Instagram)"
                  value={linkPlatform}
                  onChange={(e) => setLinkPlatform(e.target.value)}
                  className="w-1/3"
                />
                <Input
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addLink();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addLink}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {links.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {links.map((link, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {link.platform && (
                        <span className="font-medium">{link.platform}:</span>
                      )}
                      {new URL(link.url).hostname}
                      <button
                        type="button"
                        onClick={() => removeLink(i)}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-muted"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        ) : (
          /* Result view */
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-primary" />
                Design Generated Successfully
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {ai.designSpec?.metadata?.suggestedName &&
                  `Suggested name: "${ai.designSpec.metadata.suggestedName}"`}
                {ai.designSpec?.blocks && (
                  <span>
                    {" "}
                    &middot; {ai.designSpec.blocks.length} blocks created
                  </span>
                )}
                {ai.designSpec?.socialLinks && (
                  <span>
                    {" "}
                    &middot; {ai.designSpec.socialLinks.length} social links
                  </span>
                )}
              </p>
            </div>

            {/* Quick regeneration */}
            {showRegen ? (
              <div className="space-y-2">
                <Label htmlFor="regen-prompt">What would you like to change?</Label>
                <div className="flex gap-2">
                  <Input
                    id="regen-prompt"
                    placeholder="e.g. Make the buttons more modern, change to a lighter theme..."
                    value={regenPrompt}
                    onChange={(e) => setRegenPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleRegenerate();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleRegenerate}
                    disabled={isGenerating || !regenPrompt.trim()}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRegen(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRegen(true)}
                >
                  <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                  Regenerate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveAsPreset}
                  disabled={ai.saveAsPreset.isPending}
                >
                  {ai.saveAsPreset.isPending ? "Saving..." : "Save as Preset"}
                </Button>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {!hasResult ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>
                Discard
              </Button>
              <Button onClick={handleApply}>
                Apply to Page
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
