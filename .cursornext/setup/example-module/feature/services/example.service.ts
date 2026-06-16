import type {
  ExampleFormValues,
  ExampleItem,
} from "@/features/example/types/example.types";

/**
 * Example feature service.
 *
 * This template uses an in-memory mock so the scaffolded module runs out of the
 * box. Replace these with real calls through the axios client in `@/lib`
 * (e.g. `import { api } from "@/lib/network"`) and your API paths.
 */

let MEMORY: ExampleItem[] = [
  {
    id: "1",
    name: "Ada Lovelace",
    email: "ada@example.com",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Alan Turing",
    email: "alan@example.com",
    createdAt: new Date().toISOString(),
  },
];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const exampleService = {
  list: async (): Promise<ExampleItem[]> => {
    await delay(300);
    return [...MEMORY];
  },

  create: async (values: ExampleFormValues): Promise<ExampleItem> => {
    await delay(300);
    const item: ExampleItem = {
      id: String(Date.now()),
      name: values?.name,
      email: values?.email,
      createdAt: new Date().toISOString(),
    };
    MEMORY = [item, ...MEMORY];
    return item;
  },
};
