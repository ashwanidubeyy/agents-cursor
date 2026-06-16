export interface ExampleItem {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface ExampleFormValues {
  name: string;
  email: string;
}

export interface ExampleState {
  items: ExampleItem[];
  loading: boolean;
  error: string | null;
}
