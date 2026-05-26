"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CatalogTankPhotosInput } from "@/lib/catalog-tanks";

type Props = {
  initialUrls?: string[];
  onChange: (input: CatalogTankPhotosInput) => void;
};

const inputClass =
  "mt-1.5 w-full rounded-lg border border-border bg-input px-4 py-2.5 text-foreground placeholder:text-subtle focus:border-accent focus:outline-none focus:ring-1 focus:ring-ring";

function photosSnapshot(
  kept: string[],
  files: File[],
  urlFields: string[],
): string {
  return JSON.stringify({
    kept,
    urls: urlFields,
    files: files.map((f) => `${f.name}:${f.size}:${f.lastModified}`),
  });
}

function buildInput(
  kept: string[],
  files: File[],
  urlFields: string[],
): CatalogTankPhotosInput {
  return { keepUrls: kept, uploadFiles: files, pasteUrls: urlFields };
}

export function CatalogTankPhotosEditor({ initialUrls = [], onChange }: Props) {
  const [kept, setKept] = useState<string[]>(initialUrls);
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [urlFields, setUrlFields] = useState<string[]>([""]);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const lastSnapshot = useRef(
    photosSnapshot(initialUrls, [], [""]),
  );

  function emitChange(nextKept: string[], nextFiles: File[], nextUrls: string[]) {
    const snap = photosSnapshot(nextKept, nextFiles, nextUrls);
    if (snap === lastSnapshot.current) return;
    lastSnapshot.current = snap;
    onChangeRef.current(buildInput(nextKept, nextFiles, nextUrls));
  }

  useEffect(() => {
    emitChange(kept, files, urlFields);
  }, [kept, files, urlFields]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setFilePreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  function removeKept(url: string) {
    setKept((prev) => {
      const next = prev.filter((u) => u !== url);
      return next;
    });
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function addFiles(list: FileList | null) {
    if (!list?.length) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
  }

  function addUrlField() {
    setUrlFields((prev) => [...prev, ""]);
  }

  function updateUrlField(index: number, value: string) {
    setUrlFields((prev) => prev.map((u, i) => (i === index ? value : u)));
  }

  function removeUrlField(index: number) {
    setUrlFields((prev) => (prev.length <= 1 ? [""] : prev.filter((_, i) => i !== index)));
  }

  const totalCount =
    kept.length + files.length + urlFields.filter((u) => u.trim()).length;

  return (
    <div className="space-y-6">
      {kept.length > 0 && (
        <div>
          <p className="text-sm font-medium text-heading">Current photos</p>
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {kept.map((url) => (
              <li
                key={url}
                className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border"
              >
                <Image src={url} alt="" fill className="object-cover" sizes="200px" />
                <button
                  type="button"
                  onClick={() => removeKept(url)}
                  className="absolute right-1.5 top-1.5 rounded-md bg-background/90 px-2 py-1 text-xs font-medium text-red-600 shadow hover:bg-background"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-heading">Upload photos</label>
        <p className="mt-0.5 text-xs text-muted">
          Select one or many images. You can add more later when editing.
        </p>
        <input
          type="file"
          accept="image/*"
          multiple
          className={`${inputClass} file:mr-3 file:rounded-md file:border-0 file:bg-accent-muted file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-accent`}
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        {filePreviews.length > 0 && (
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filePreviews.map((preview, i) => (
              <li
                key={`${preview}-${i}`}
                className="relative aspect-[4/3] overflow-hidden rounded-xl border border-dashed border-accent/40"
              >
                <Image src={preview} alt="" fill className="object-cover" sizes="200px" />
                <span className="absolute left-1.5 top-1.5 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                  New
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute right-1.5 top-1.5 rounded-md bg-background/90 px-2 py-1 text-xs font-medium text-red-600 shadow"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <label className="text-sm font-medium text-heading">Image URLs</label>
          <button
            type="button"
            onClick={addUrlField}
            className="text-xs font-medium text-accent hover:text-accent-hover"
          >
            + Add URL
          </button>
        </div>
        <p className="mt-0.5 text-xs text-muted">Paste direct links to images (https://…).</p>
        <div className="mt-2 space-y-2">
          {urlFields.map((value, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="url"
                className={inputClass}
                value={value}
                onChange={(e) => updateUrlField(i, e.target.value)}
                placeholder="https://…"
              />
              {urlFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeUrlField(i)}
                  className="shrink-0 rounded-lg border border-border px-3 text-xs text-muted hover:bg-card-muted"
                  aria-label="Remove URL field"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-subtle">
        {totalCount === 0
          ? "Add at least one photo to publish."
          : `${totalCount} photo${totalCount === 1 ? "" : "s"} ready to save`}
      </p>
    </div>
  );
}
