"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const FieldMap = dynamic(() => import("@/components/fields/FieldMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[420px] w-full items-center justify-center rounded-2xl border border-border bg-surface-muted">
      <p className="text-sm text-muted">Harita yükleniyor...</p>
    </div>
  ),
});

type FieldMapLoaderProps = ComponentProps<typeof FieldMap>;

export default function FieldMapLoader(props: FieldMapLoaderProps) {
  return <FieldMap {...props} />;
}
