"use client";

import ExampleForm from "@/features/example/components/ExampleForm";
import ExampleList from "@/features/example/components/ExampleList";
import { useExample } from "@/features/example/hooks/useExample";

/**
 * Sample route at /example demonstrating the feature-first structure:
 * - feature UI:      @/features/example/components/*
 * - feature hook:    @/features/example/hooks/useExample
 * - feature service: @/features/example/services/example.service
 * - feature types:   @/features/example/types/example.types
 * - feature store:   @/features/example/store/exampleSlice (optional)
 */
export default function ExamplePage() {
  const { items, loading, create } = useExample();

  return (
    <main style={{ maxWidth: "48rem", margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>Example feature</h1>
      <p>A self-contained feature module scaffolded by the agent kit.</p>

      <section style={{ margin: "1.5rem 0" }}>
        <h2>Add</h2>
        <ExampleForm onCreate={create} />
      </section>

      <section>
        <h2>Items</h2>
        <ExampleList items={items} loading={loading} />
      </section>
    </main>
  );
}
