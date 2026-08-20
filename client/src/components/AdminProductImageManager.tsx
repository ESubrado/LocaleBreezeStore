"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImageIcon, ImagePlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";

// A gallery can contain persisted storage objects and files that have not yet
// been uploaded. Keeping them in one ordered list lets both product forms share
// the same add, remove, and reorder UI.
export type ProductImage =
  | {
      file: File;
      id: string;
      kind: "new";
      previewUrl: string;
    }
  | {
      id: string;
      kind: "existing";
      name: string;
      previewUrl?: string;
    };

/** Props for the controlled product image gallery. */
type ProductImageManagerProps = {
  disabled?: boolean;
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
};

/** Maximum upload size accepted by the browser and matching product APIs. */
const maximumImageBytes = 5 * 1024 * 1024;
/** MIME types that can be uploaded as product images. */
const supportedImageTypes = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

// Existing images are identified by their stored value; new images need a
// client-generated ID so the edit API can match them to multipart file fields.
export function createExistingProductImage(
  name: string,
  previewUrl?: string,
): ProductImage {
  return {
    id: crypto.randomUUID(),
    kind: "existing",
    name,
    previewUrl,
  };
}

/** Extracts only unsaved files for the create-product multipart request. */
export function getNewProductImageFiles(images: ProductImage[]) {
  return images.flatMap((image) =>
    image.kind === "new" ? [image.file] : [],
  );
}

/** Enforces the product gallery size and required-image rules. */
export function validateProductImages(
  images: ProductImage[],
  requireAtLeastOne = true,
) {
  if (requireAtLeastOne && images.length === 0) {
    throw new Error("Select at least one product image.");
  }

  if (images.length > 10) {
    throw new Error("A product can have at most 10 images.");
  }
}

/** Validates files selected in the image picker before creating previews. */
function validateFiles(files: File[], imageCount: number) {
  if (imageCount > 10) {
    throw new Error("A product can have at most 10 images.");
  }

  for (const file of files) {
    if (!supportedImageTypes.has(file.type)) {
      throw new Error(
        file.name + " is not supported. Use AVIF, GIF, JPEG, PNG, or WebP.",
      );
    }

    if (file.size > maximumImageBytes) {
      throw new Error(file.name + " must be 5 MB or smaller.");
    }
  }
}

export default function AdminProductImageManager({
  disabled = false,
  images,
  onChange,
}: ProductImageManagerProps) {
  /** Tracks browser object URLs so each preview can be released safely. */
  const previewUrls = useRef(new Set<string>());
  /** Displays local picker validation feedback without blocking the form UI. */
  const [error, setError] = useState("");

  useEffect(() => {
    // Object URLs are created only for unsaved files and must be released when
    // this dialog closes to avoid retaining image data in the browser.
    const urls = previewUrls.current;

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  /** Adds selected files to the ordered gallery and creates their previews. */
  function addImages(fileList: FileList | null) {
    if (!fileList) {
      return;
    }

    /** Converts the browser file list into an array for validation and mapping. */
    const files = Array.from(fileList);

    try {
      validateFiles(files, images.length + files.length);
      /** New items retain their file and preview until the product is saved. */
      const nextImages: ProductImage[] = files.map((file) => {
        /** Temporary object URL used to preview the just-selected image. */
        const previewUrl = URL.createObjectURL(file);
        previewUrls.current.add(previewUrl);

        return {
          file,
          id: crypto.randomUUID(),
          kind: "new",
          previewUrl,
        };
      });

      onChange([...images, ...nextImages]);
      setError("");
    } catch (fileError) {
      setError(
        fileError instanceof Error
          ? fileError.message
          : "Unable to add the selected images.",
      );
    }
  }

  /** Removes an image and releases its local preview when it is unsaved. */
  function removeImage(id: string) {
    /** The item determines whether a browser object URL needs cleanup. */
    const image = images.find((item) => item.id === id);

    if (image?.kind === "new") {
      URL.revokeObjectURL(image.previewUrl);
      previewUrls.current.delete(image.previewUrl);
    }

    onChange(images.filter((item) => item.id !== id));
  }

  /** Moves an image by one position; the first image remains the primary one. */
  function moveImage(id: string, direction: -1 | 1) {
    /** Current item index used to calculate the requested adjacent position. */
    const currentIndex = images.findIndex((image) => image.id === id);
    const nextIndex = currentIndex + direction;

    if (
      currentIndex < 0 ||
      nextIndex < 0 ||
      nextIndex >= images.length
    ) {
      return;
    }

    const reorderedImages = [...images];
    const [image] = reorderedImages.splice(currentIndex, 1);
    reorderedImages.splice(nextIndex, 0, image);
    onChange(reorderedImages);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-300">Product images</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Add up to 10 AVIF, GIF, JPEG, PNG, or WebP files (5 MB each). The
            first image is the primary storefront image.
          </p>
        </div>
        <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-blue-500/30 bg-blue-500/10 px-3 text-sm font-medium text-blue-100 transition hover:bg-blue-500/20">
          <ImagePlus className="size-4" />
          Add images
          <input
            accept="image/avif,image/gif,image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={disabled || images.length >= 10}
            multiple
            onChange={(event) => {
              addImages(event.currentTarget.files);
              event.currentTarget.value = "";
            }}
            type="file"
          />
        </label>
      </div>

      {images.length > 0 ? (
        <ol className="mt-4 grid gap-3 sm:grid-cols-2">
          {images.map((image, index) => {
            const imageName = image.kind === "new" ? image.file.name : image.name;

            return (
              <li
                key={image.id}
                className="overflow-hidden rounded-md border border-white/10 bg-slate-950/50"
              >
                {image.kind === "new" ? (
                  <img
                    alt=""
                    className="h-32 w-full object-cover"
                    src={image.previewUrl}
                  />
                ) : image.previewUrl ? (
                  <img
                    alt=""
                    className="h-32 w-full object-cover"
                    src={image.previewUrl}
                  />
                ) : (
                  <div className="flex h-32 w-full flex-col items-center justify-center gap-2 bg-white/[0.03] text-slate-500">
                    <ImageIcon className="size-7" aria-hidden="true" />
                    <span className="text-xs">Current product image</span>
                  </div>
                )}
                <div className="flex items-center gap-2 p-2">
                  <span
                    className="min-w-0 flex-1 truncate text-xs text-slate-300"
                    title={imageName}
                  >
                    {index === 0 ? "Primary · " : ""}
                    {imageName}
                  </span>
                  <Button
                    aria-label={`Move ${imageName} earlier`}
                    disabled={disabled || index === 0}
                    onClick={() => moveImage(image.id, -1)}
                    size="icon-xs"
                    type="button"
                    variant="ghost"
                  >
                    <ArrowLeft />
                  </Button>
                  <Button
                    aria-label={`Move ${imageName} later`}
                    disabled={disabled || index === images.length - 1}
                    onClick={() => moveImage(image.id, 1)}
                    size="icon-xs"
                    type="button"
                    variant="ghost"
                  >
                    <ArrowRight />
                  </Button>
                  <Button
                    aria-label={`Delete ${imageName}`}
                    className="text-red-300 hover:bg-red-500/10 hover:text-red-200"
                    disabled={disabled}
                    onClick={() => removeImage(image.id)}
                    size="icon-xs"
                    type="button"
                    variant="ghost"
                  >
                    <X />
                  </Button>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="mt-4 rounded-md border border-dashed border-white/15 px-3 py-5 text-center text-sm text-slate-500">
          No images selected yet. Add at least one image before saving.
        </p>
      )}

      {error ? (
        <p className="mt-3 text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
