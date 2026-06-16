"use client";

import { useCallback, useEffect, useState } from "react";
import { exampleService } from "@/features/example/services/example.service";
import type {
  ExampleFormValues,
  ExampleItem,
} from "@/features/example/types/example.types";

/**
 * Feature hook for the example module.
 *
 * Uses local state + the service so the scaffolded page runs without Redux.
 * To switch to Redux, register `exampleSlice` in `@/store` and dispatch
 * `fetchExamples` / `createExample` here instead.
 */
export const useExample = () => {
  const [items, setItems] = useState<ExampleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    exampleService
      .list()
      .then((data) => setItems(data ?? []))
      .catch((err) => setError(err?.message ?? "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback((values: ExampleFormValues) => {
    return exampleService
      .create(values)
      .then((item) => {
        setItems((prev) => [item, ...prev]);
        return item;
      })
      .catch((err) => {
        setError(err?.message ?? "Failed to create");
        return null;
      });
  }, []);

  return { items, loading, error, create, reload: load };
};
